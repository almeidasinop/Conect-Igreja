import {
  FaviconSettings,
  MasterIcon,
  generateFaviconFiles,
  generateFaviconHtml,
  IconTransformationType
} from "@realfavicongenerator/generate-favicon";
import {
  getNodeImageAdapter,
  loadAndConvertToSvg
} from "@realfavicongenerator/image-adapter-node";
import fs from "fs";
import path from "path";

(async () => {
  const imageAdapter = await getNodeImageAdapter();
  const masterIcon: MasterIcon = {
    icon: await loadAndConvertToSvg("favicon.svg"),
  };

  const faviconSettings: FaviconSettings = {
    icon: {
      desktop: {
        regularIconTransformation: { type: IconTransformationType.None },
        darkIconType: "regular",
        darkIconTransformation: { type: IconTransformationType.None },
      },
      touch: {
        transformation: { type: IconTransformationType.None },
        appTitle: "ConectIgreja"
      },
      webAppManifest: {
        transformation: { type: IconTransformationType.None },
        backgroundColor: "#ffffff",
        themeColor: "#ffffff",
        name: "ConectIgreja",
        shortName: "ConectIgreja"
      }
    },
    path: "/icons/",
  };

  const files = await generateFaviconFiles(masterIcon, faviconSettings, imageAdapter);
  const html = await generateFaviconHtml(faviconSettings);

  const outputDir = path.join("public", "icons");
  fs.mkdirSync(outputDir, { recursive: true });

  for (const file of files) {
    fs.writeFileSync(path.join(outputDir, file.name), file.contents);
  }

  fs.writeFileSync(path.join(outputDir, "favicon-snippets.html"), html.join("\n"));
  console.log("✔️ Favicons gerados com sucesso em /public/icons/");
})();
