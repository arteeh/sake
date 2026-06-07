# arteeh's sake tier list

A small GitHub Pages site whose sake reviews are stored as Markdown files.

## Add a review

1. Put the bottle photo in `images/`.
2. Create a Markdown file in the appropriate `S`, `A`, `K`, or `E` tier folder, such as `_reviews/S/my-sake.md`:

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

GitHub Pages' built-in Jekyll build discovers every Markdown file in the `_reviews` collection and renders it directly into `index.html`. The browser receives the complete tier list with the page, so loading reviews uses no GitHub API calls or additional requests. Reviews are grouped by their tier folder and ordered alphabetically by filename.

The leading underscore in `_reviews` tells Jekyll that the directory is a collection. Adding a review only requires placing its Markdown file in the appropriate tier folder; there is no review manifest to update.

## Preview locally

GitHub Pages builds the review collection before serving the site. To preview that generated page locally, install Jekyll and run:

```sh
jekyll serve
```

Then visit <http://localhost:4000>.
