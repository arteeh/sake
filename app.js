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

async function loadReview(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Could not load ${path}`);
  return parseReview(await response.text());
}

async function renderTierList() {
  try {
    const response = await fetch("reviews/index.json");
    if (!response.ok) throw new Error("Could not load reviews/index.json");
    const manifest = await response.json();

    const sections = await Promise.all(
      Object.entries(tiers).map(async ([letter, description]) => {
        const paths = manifest[letter] || [];
        const reviews = await Promise.all(paths.map(loadReview));
        return createTier(letter, description, reviews.map(createCard));
      }),
    );

    tierList.replaceChildren(...sections);
  } catch (error) {
    console.error(error);
    tierList.innerHTML = `
      <div class="load-error">
        <h2>The reviews could not be loaded.</h2>
        <p>Run the site through a local server or check the review manifest.</p>
      </div>
    `;
  }
}

renderTierList();
