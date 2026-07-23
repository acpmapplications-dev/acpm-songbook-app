import { renderHtml } from "./renderHtml";

interface SongInput {
	songnumber: number;
	title: string;
	lyrics: string;
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname.replace(/\/$/, "");
		const method = request.method;

		// --- JSON API routes ---
		// GET /api/version -> returns current DB version for songs
		if (path === "/api/version" && method === "GET") {
			  const row = await env.DB.prepare(
			    "SELECT value FROM db_meta WHERE key = 'songs_version'"
			  ).first<{ value: string }>();
			
			  return Response.json({
			    version: row ? row.value : "0",
			  });
			}

		// GET /api/songs -> list all songs
		if (path === "/api/songs" && method === "GET") {
			const { results } = await env.DB.prepare(
				"SELECT id, title as lyrics_title, lyrics FROM songs"
			).all();
			return Response.json(results);
		}

		

		// POST /api/songs -> insert a new song
		if (path === "/api/songs" && method === "POST") {
			let body: Partial<SongInput>;
			try {
				body = await request.json();
			} catch {
				return Response.json({ error: "Invalid JSON body" }, { status: 400 });
			}

			const { songnumber, title, lyrics } = body;

			if (songnumber === undefined || !title || !lyrics) {
				return Response.json(
					{ error: "songnumber, title and lyrics are required" },
					{ status: 400 }
				);
			}

			try {
				const result = await env.DB.prepare(
					`INSERT INTO songs (songnumber, title, lyrics)
					 VALUES (?, ?, ?)
					 RETURNING id, songnumber, title, lyrics`
				)
					.bind(songnumber, title, lyrics)
					.first();

				return Response.json(result, { status: 201 });
			} catch (insertErr) {
				return Response.json(
					{ error: `Could not insert song: ${(insertErr as Error).message}` },
					{ status: 409 }
				);
			}
		}

		// --- Default HTML demo page ---
		const stmt = env.DB.prepare("SELECT * FROM songs LIMIT 3");
		const { results } = await stmt.all();

		return new Response(renderHtml(JSON.stringify(results, null, 2)), {
			headers: {
				"content-type": "text/html",
			},
		});
	},
} satisfies ExportedHandler<Env>;
