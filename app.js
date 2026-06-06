const tiers = {
  S: "exceptional",
  A: "excellent",
  B: "very good",
  C: "pretty okay",
  D: "not for me",
  E: "rough",
  F: "never again",
};

const tierList = document.querySelector("#tier-list");
const repository = "arteeh/sake";
const githubApi = `https://api.github.com/repos/${repository}`;

function parseReview(source) {
  const match = source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);

  if (!match) {
    throw new Error("Review is missing its front matter block.");
  }

  const metadata = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    metadata[key] = value;
  }

  return { metadata, body: match[2].trim() };
}

function formatDate(date) {
  if (!date) return "Date unknown";

  const parsedDate = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsedDate.valueOf())) return date;

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  }).format(parsedDate);
}

function createPhoto(metadata) {
  if (metadata.image) {
    const image = document.createElement("img");
    image.src = metadata.image;
    image.alt = metadata.imageAlt || `Bottle of ${metadata.name}`;
    image.loading = "lazy";
    return image;
  }

  const placeholder = document.createElement("div");
  placeholder.className = "photo-placeholder";
  placeholder.setAttribute("role", "img");
  placeholder.setAttribute("aria-label", "No sake photo added yet");
  placeholder.innerHTML = "<span>your photo</span>";
  return placeholder;
}

function createCard(review) {
  const { metadata, body } = review;
  const card = document.createElement("article");
  card.className = "sake-card";
  card.append(createPhoto(metadata));

  const copy = document.createElement("div");
  copy.className = "card-copy";

  const date = document.createElement("p");
  date.className = "date";
  date.textContent = formatDate(metadata.date);

  const name = document.createElement("h3");
  name.textContent = metadata.name || "Unnamed sake";

  copy.append(date, name);

  if (body) {
    const review = document.createElement("div");
    review.className = "review markdown-body";
    review.innerHTML = DOMPurify.sanitize(marked.parse(body));
    copy.append(review);
  }

  card.append(copy);
  return card;
}

function createTier(letter, description, cards) {
  const tier = document.createElement("section");
  tier.className = `tier tier-${letter.toLowerCase()}`;
  tier.setAttribute("aria-labelledby", `tier-${letter.toLowerCase()}-title`);

  tier.innerHTML = `
    <div class="tier-label">
      <h2 id="tier-${letter.toLowerCase()}-title">${letter}</h2>
      <span>${description}</span>
    </div>
  `;

  const entries = document.createElement("div");
  entries.className = "tier-entries";

  if (cards.length) {
    entries.append(...cards);
  } else {
    entries.classList.add("empty-tier");
    entries.innerHTML = "<p>Nothing here yet.</p>";
  }

  tier.append(entries);
  return tier;
}

async function fetchFromGitHub(path, ref) {
  const url = new URL(`${githubApi}/${path}`);
  if (ref) url.searchParams.set("ref", ref);

  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!response.ok) {
    const error = new Error(`GitHub returned ${response.status} for ${path}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

async function findReviewsRef() {
  try {
    return { ref: undefined, entries: await fetchFromGitHub("contents/reviews") };
  } catch (error) {
    if (error.status !== 404) throw error;
  }

  // A GitHub Pages preview can be built from a branch other than the default
  // branch. Find that branch automatically until the site changes are merged.
  const branches = await fetchFromGitHub("branches?per_page=100");
  for (const branch of branches) {
    try {
      const entries = await fetchFromGitHub("contents/reviews", branch.name);
      return { ref: branch.name, entries };
    } catch (error) {
      if (error.status !== 404) throw error;
    }
  }

  throw new Error("No branch contains a reviews folder.");
}

async function loadReview(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load ${url}`);
  return parseReview(await response.text());
}

async function loadTierReviews(letter, ref) {
  const entries = await fetchFromGitHub(`contents/reviews/${letter}`, ref);
  const files = entries
    .filter((entry) => entry.type === "file" && entry.name.endsWith(".md"))
    .sort((left, right) => left.name.localeCompare(right.name));

  return Promise.all(files.map((file) => loadReview(file.download_url)));
}

async function renderTierList() {
  try {
    const { ref, entries } = await findReviewsRef();
    const availableFolders = new Set(
      entries.filter((entry) => entry.type === "dir").map((entry) => entry.name),
    );

    const sections = await Promise.all(
      Object.entries(tiers).map(async ([letter, description]) => {
        const reviews = availableFolders.has(letter)
          ? await loadTierReviews(letter, ref)
          : [];
        return createTier(letter, description, reviews.map(createCard));
      }),
    );

    tierList.replaceChildren(...sections);
  } catch (error) {
    console.error(error);
    tierList.innerHTML = `
      <div class="load-error">
        <h2>The reviews could not be loaded.</h2>
        <p>Check that this public repository has review folders available on GitHub.</p>
      </div>
    `;
  }
}

renderTierList();
