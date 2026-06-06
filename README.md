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

The `image` value can be left blank to show a placeholder. The review below the front matter is optional and supports standard Markdown, including links, lists, emphasis, and images:

```md
![A glass of sake](images/my-sake-pour.jpg)
```

## How reviews are loaded

`app.js` uses GitHub's public repository API to find the tier folders and load every Markdown file in them, so adding a review does not require updating a manifest. Reviews are ordered alphabetically by filename. During a GitHub Pages branch preview, the script automatically finds the branch containing the `reviews/` folder; after merge, it uses the default branch.

The site uses [marked](https://marked.js.org/) to turn Markdown into HTML. Rendered HTML is sanitized with [DOMPurify](https://github.com/cure53/DOMPurify). Because folder discovery uses GitHub's unauthenticated API, the repository must remain public.

## Preview locally

Because the page fetches review files, opening `index.html` directly with a `file://` URL will not work. Start a small local server instead:

```sh
python3 -m http.server 8000
```

Then visit <http://localhost:8000>.
