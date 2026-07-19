export function renderHtml(content: string) {
	return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>D1</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>
    
      <body>
        <header>
          <img
            src="https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/30e0d3f6-6076-40f8-7abb-8a7676f83c00/public"
          />
          <h1>🎉 Successfully connected d1-template to D1</h1>
        </header>
        <main>
          <p>Your D1 Database contains the following data:</p>
          <pre><code><span style="color: #0E838F">&gt; </span>SELECT * FROM songs LIMIT 3;<br>${content}</code></pre>

          <h2>Add a new song</h2>
          <form id="song-form">
            <label>Song number: <input type="number" name="songnumber" required /></label><br/>
            <label>Title: <input type="text" name="title" required /></label><br/>
            <label>Lyrics:<br/><textarea name="lyrics" rows="4" required></textarea></label><br/>
            <button type="submit">Add Song</button>
          </form>
          <p id="form-result"></p>

          <small class="blue">
            <a target="_blank" href="https://developers.cloudflare.com/d1/tutorials/build-a-comments-api/">Build a comments API with Workers and D1</a>
          </small>
        </main>

        <script>
          const form = document.getElementById("song-form");
          const resultEl = document.getElementById("form-result");

          form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const payload = {
              songnumber: Number(formData.get("songnumber")),
              title: formData.get("title"),
              lyrics: formData.get("lyrics"),
            };

            const res = await fetch("/api/songs", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
              resultEl.textContent = "Added: " + JSON.stringify(data);
              form.reset();
              location.reload(); // refresh page to show it in the LIMIT 3 list
            } else {
              resultEl.textContent = "Error: " + JSON.stringify(data);
            }
          });
        </script>
      </body>
    </html>
`;
}