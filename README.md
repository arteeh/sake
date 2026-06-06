# arteeh's sake tier list

A small GitHub Pages site whose sake reviews are stored as Markdown files.

## Add a review

1. Put the bottle photo in `images/`.
2. Create a Markdown file in the appropriate tier folder, such as `reviews/S/my-sake.md`:

   ```md
   ---
   name: My sake
   date: 2026-06-06
   image: images/my-sake.jpg
   imageAlt: Bottle of My Sake
   ---
   Your optional **Markdown review** goes here.
   ```

3. Add the file path to the matching tier in `reviews/index.json`. The order in that array is the order shown on the page.

The `image` value can be left blank to show a placeholder. The review below the front matter is optional and supports standard Markdown, including links, lists, emphasis, and images:

```md
![A glass of sake](images/my-sake-pour.jpg)
```

## Why there is a manifest

A static GitHub Pages site cannot automatically list the files inside the `reviews/` folders. `reviews/index.json` is a small manifest that tells the browser which Markdown files to fetch. `app.js` loads those files and uses [marked](https://marked.js.org/) to turn Markdown into HTML. Rendered HTML is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify).

## Preview locally

Because the page fetches review files, opening `index.html` directly with a `file://` URL will not work. Start a small local server instead:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
