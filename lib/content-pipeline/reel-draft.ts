export type PipelineRecipe = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  category: string | null;
  cuisines: string[];
  totalMinutes: number | null;
  ingredients: string[];
  methods: Array<{
    title: string;
    description: string | null;
  }>;
};

export type ReelScene = {
  id: string;
  seconds: string;
  label: string;
  text: string;
  voiceoverLine: string;
  speechLine: string;
  visual: string;
};

export type ContentDraft = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  recipeUrl: string;
  imageUrl: string | null;
  status: "pending" | "approved" | "needs_edit";
  platforms: string[];
  hook: string;
  durationSeconds: number;
  scenes: ReelScene[];
  voiceover: string;
  voiceoverSpeech: string;
  instagramCaption: string;
  youtubeTitle: string;
  youtubeDescription: string;
  facebookPost: string;
  xPost: string;
  linkedinPost: string;
  pinterestTitle: string;
  pinterestDescription: string;
  hashtags: string[];
  renderSpec: {
    format: "1080x1920";
    template: string;
    assets: Array<{
      type: "image" | "voiceover" | "music";
      value: string;
    }>;
  };
};

const SITE_URL = "https://www.kyakhayen.com";

function cleanTitle(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function titleToHashtag(title: string) {
  return title
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");
}

function compactList(items: string[], max = 3) {
  return items
    .map(simplifyIngredientName)
    .filter(Boolean)
    .slice(0, max);
}

function stripHtml(value: string | null | undefined) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(value: string, max = 72) {
  const clean = stripHtml(value);
  return clean.length > max ? `${clean.slice(0, max - 1).trim()}...` : clean;
}

function simplifyIngredientName(value: string) {
  return stripHtml(value)
    .replace(/^\d+(\.\d+)?\s*/i, "")
    .replace(/^(g|kg|ml|l|cup|cups|tbsp|tsp|pinch|no|nos|piece|pieces)\s+/i, "")
    .replace(
      /^(raw|fresh|dried|whole|powdered|chopped|finely|paste|cubes|pureed)\s+/i,
      ""
    )
    .replace(
      /^(raw|fresh|dried|whole|powdered|chopped|finely|paste|cubes|pureed)\s+/i,
      ""
    )
    .replace(/\s+/g, " ")
    .trim();
}

function recipeMode(title: string, recipe: PipelineRecipe) {
  const text = `${title} ${recipe.category ?? ""} ${recipe.ingredients.join(" ")}`.toLowerCase();

  if (/(water|tea|infusion|smoothie|juice|lassi|drink|detox|sharbat|kadha)/.test(text)) {
    return "drink";
  }

  if (/(paneer|masala|curry|sabzi|dal|chole|bhature|bhurji|gravy)/.test(text)) {
    return "curry";
  }

  return "generic";
}

function readableJoin(items: string[], fallback: string) {
  return items.length ? items.join(" + ") : fallback;
}

function minutesSpeech(totalMinutes: number | null) {
  if (!totalMinutes) return "Yeh ek simple homemade recipe hai.";
  return `Yeh recipe lagbhag ${totalMinutes} minute mein ready ho jaati hai.`;
}

function ingredientSpeech(items: string[], mode: "drink" | "curry" | "generic") {
  if (mode === "drink") {
    return "Iske liye bas warm water aur kuch simple spices chahiye.";
  }

  if (!items.length) return "Iske liye fresh ingredients aur simple spices chahiye.";

  return `Main ingredients hain ${items.slice(0, 3).join(", ")}.`;
}

function buildHashtags(recipe: PipelineRecipe) {
  const tags = [
    titleToHashtag(recipe.title),
    `${titleToHashtag(recipe.title)}Recipe`,
    recipe.category ? titleToHashtag(recipe.category) : "",
    ...recipe.cuisines.map(titleToHashtag),
    "IndianFood",
    "DinnerRecipe",
    "VegetarianRecipe",
    "Kyakhayen",
  ];

  return Array.from(new Set(tags.filter(Boolean))).slice(0, 12);
}

function formatHashtags(hashtags: string[]) {
  return hashtags.map((tag) => `#${tag}`).join(" ");
}

function socialOpening(title: string, mode: "drink" | "curry" | "generic") {
  if (mode === "drink") return `${title} for slow mornings.`;
  if (mode === "curry") return `${title} for an easy dinner plan.`;
  return `${title} for a simple homemade meal.`;
}

function socialBody(mode: "drink" | "curry" | "generic") {
  if (mode === "drink") {
    return "Warm, light, and easy to save for the next time you want something soothing.";
  }

  if (mode === "curry") {
    return "Comforting, flavorful, and simple enough to make at home without overthinking dinner.";
  }

  return "A practical recipe idea with clean steps, good flavor, and a reason to save it.";
}

export function buildContentDraft(recipe: PipelineRecipe): ContentDraft {
  const title = cleanTitle(recipe.title);
  const recipeUrl = `${SITE_URL}/${recipe.slug}`;
  const mode = recipeMode(title, recipe);
  const ingredients = compactList(recipe.ingredients, 5);
  const heroIngredients = compactList(recipe.ingredients, 3);
  const timeText = recipe.totalMinutes
    ? `Ready in ${recipe.totalMinutes} min`
    : "Easy homemade recipe";
  const hook = /paneer|masala|curry/i.test(title)
    ? `Restaurant style ${title}`
    : mode === "drink"
      ? title
      : `Try this ${title}`;

  const ingredientText = readableJoin(
    heroIngredients,
    mode === "drink" ? "Warm water + simple spices" : "Fresh ingredients + simple spices"
  );
  const drinkMethodText = "Steep, strain, and sip";
  const cookMethodText =
    mode === "curry" ? "Cook the masala until glossy" : "Cook until flavor comes together";
  const finishScreenText = mode === "drink" ? "Serve it warm" : "Finish and serve hot";
  const ctaScreenText = "Save this recipe";

  const scenes: ReelScene[] =
    mode === "drink"
      ? [
          {
            id: "hook",
            seconds: "0-3",
            label: "Hook",
            text: shortText(hook, 48),
            voiceoverLine: `${title} ghar par banana bahut simple hai.`,
            speechLine: `${title} ghar par banana bahut simple hai.`,
            visual: "Warm close-up with slow zoom",
          },
          {
            id: "time",
            seconds: "3-6",
            label: "Timing",
            text: timeText,
            voiceoverLine: `${minutesSpeech(recipe.totalMinutes)} Bas kuch everyday ingredients chahiye.`,
            speechLine: `${minutesSpeech(recipe.totalMinutes)} Bas kuch everyday ingredients chahiye.`,
            visual: "Timer badge with gentle pan",
          },
          {
            id: "ingredients",
            seconds: "6-10",
            label: "Ingredients",
            text: ingredientText,
            voiceoverLine: ingredientSpeech(ingredients, mode),
            speechLine: ingredientSpeech(ingredients, mode),
            visual: "Ingredient names appear one by one",
          },
          {
            id: "steep",
            seconds: "10-15",
            label: "Steep",
            text: drinkMethodText,
            voiceoverLine:
              "In ingredients ko warm water mein kuch minute ke liye steep hone dein.",
            speechLine:
              "In ingredients ko warm water mein kuch minute ke liye steep hone dein, taaki flavor achchhe se aa jaaye.",
            visual: "Steam overlay and close crop",
          },
          {
            id: "serve",
            seconds: "15-20",
            label: "Serve",
            text: finishScreenText,
            voiceoverLine: "Ab ise strain karke cup mein serve karein.",
            speechLine: "Ab ise strain karke cup mein serve karein.",
            visual: "Final cup crop with soft motion",
          },
          {
            id: "cta",
            seconds: "20-24",
            label: "CTA",
            text: ctaScreenText,
            voiceoverLine: "Full recipe Kya Khayen par dekhein, aur is idea ko save kar lein.",
            speechLine: "Full recipe Kya Khayen par dekhein, aur is idea ko save kar lein.",
            visual: "Logo, save prompt and final image",
          },
        ]
      : [
          {
            id: "hook",
            seconds: "0-3",
            label: "Hook",
            text: shortText(hook, 48),
            voiceoverLine:
              mode === "curry"
                ? "Restaurant-style recipe ab ghar par easily banaiye."
                : "Yeh recipe ghar par banana kaafi easy hai.",
            speechLine:
              mode === "curry"
                ? "Restaurant-style recipe ab ghar par easily banaiye."
                : "Yeh recipe ghar par banana kaafi easy hai.",
            visual: "Final dish image with slow zoom",
          },
          {
            id: "time",
            seconds: "3-6",
            label: "Timing",
            text: timeText,
            voiceoverLine: `${minutesSpeech(recipe.totalMinutes)} Dinner ke liye yeh ek tasty idea hai.`,
            speechLine: `${minutesSpeech(recipe.totalMinutes)} Dinner ke liye yeh ek tasty idea hai.`,
            visual: "Dish image pan with timer badge",
          },
          {
            id: "ingredients",
            seconds: "6-10",
            label: "Ingredients",
            text: ingredientText,
            voiceoverLine: ingredientSpeech(ingredients, mode),
            speechLine: ingredientSpeech(ingredients, mode),
            visual: "Ingredient names pop in one by one",
          },
          {
            id: "cook",
            seconds: "10-15",
            label: "Cook",
            text: cookMethodText,
            voiceoverLine:
              mode === "curry"
                ? "Onion tomato masala ko glossy aur aromatic hone tak cook karein."
                : "Medium heat par cook karein, jab tak flavor achchhe se combine ho jaaye.",
            speechLine:
              mode === "curry"
                ? "Onion tomato masala ko glossy aur aromatic hone tak cook karein."
                : "Medium heat par cook karein, jab tak flavor achchhe se combine ho jaaye.",
            visual: "Warm steam overlay on recipe image",
          },
          {
            id: "finish",
            seconds: "15-20",
            label: "Finish",
            text: finishScreenText,
            voiceoverLine:
              mode === "curry"
                ? "Paneer ko gravy mein gently simmer hone dein."
                : "Fresh garnish ke saath serve karein.",
            speechLine:
              mode === "curry"
                ? "Paneer ko gravy mein gently simmer hone dein."
                : "Fresh garnish ke saath serve karein.",
            visual: "Close crop with garnish focus",
          },
          {
            id: "cta",
            seconds: "20-24",
            label: "CTA",
            text: ctaScreenText,
            voiceoverLine: "Full recipe Kya Khayen par dekhein, aur is idea ko save kar lein.",
            speechLine: "Full recipe Kya Khayen par dekhein, aur is idea ko save kar lein.",
            visual: "Final dish with logo and save prompt",
          },
        ];

  const voiceover = scenes.map((scene) => scene.voiceoverLine).join(" ");
  const voiceoverSpeech = scenes.map((scene) => scene.speechLine).join(" ");

  const hashtags = buildHashtags(recipe);
  const primaryHashtags = formatHashtags(hashtags.slice(0, 6));
  const compactHashtags = formatHashtags(hashtags.slice(0, 4));
  const captionIntro = socialOpening(title, mode);
  const captionBody = socialBody(mode);
  const caption = [
    captionIntro,
    "",
    captionBody,
    "",
    `Full recipe: ${recipeUrl}`,
    "",
    primaryHashtags,
  ].join("\n");
  const facebookPost = [
    captionIntro,
    "",
    captionBody,
    "",
    `Full recipe: ${recipeUrl}`,
    "",
    primaryHashtags,
  ]
    .filter(Boolean)
    .join("\n");
  const xPost = [
    `${captionIntro} ${timeText}.`,
    `Full recipe: ${recipeUrl}`,
    compactHashtags,
  ]
    .filter(Boolean)
    .join("\n")
    .slice(0, 275);
  const linkedinPost = [
    captionIntro,
    "",
    captionBody,
    "",
    `Read the full recipe: ${recipeUrl}`,
    "",
    primaryHashtags,
  ]
    .filter(Boolean)
    .join("\n");
  const youtubeDescription = [
    captionIntro,
    "",
    captionBody,
    "",
    `Full recipe: ${recipeUrl}`,
    "",
    primaryHashtags,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    id: `draft-${recipe.id}`,
    recipeId: recipe.id,
    recipeTitle: title,
    recipeUrl,
    imageUrl: recipe.imageUrl,
    status: "pending",
    platforms: [
      "Instagram Reel",
      "Facebook Reel",
      "YouTube Short",
      "Facebook Post",
      "Pinterest Pin",
      "X Post",
      "LinkedIn Post",
    ],
    hook,
    durationSeconds: 24,
    scenes,
    voiceover,
    voiceoverSpeech,
    instagramCaption: caption,
    youtubeTitle: `${title} | Quick Recipe | Kyakhayen`,
    youtubeDescription,
    facebookPost,
    xPost,
    linkedinPost,
    pinterestTitle: `${title} Recipe`,
    pinterestDescription: `${hook}. ${timeText}. Save this easy recipe idea from Kyakhayen: ${recipeUrl}`,
    hashtags,
    renderSpec: {
      format: "1080x1920",
      template: "recipe-image-text-voiceover-v1",
      assets: [
        ...(recipe.imageUrl ? [{ type: "image" as const, value: recipe.imageUrl }] : []),
        { type: "voiceover", value: voiceoverSpeech },
        { type: "music", value: "light-indian-instrumental" },
      ],
    },
  };
}
