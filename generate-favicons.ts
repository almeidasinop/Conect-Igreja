import { FaviconSettings, MasterIcon, generateFaviconFiles, generateFaviconHtml, IconTransformationType } from '@realfavicongenerator/generate-favicon';
import { getNodeImageAdapter, loadAndConvertToSvg } from "@realfavicongenerator/image-adapter-node";
import fs from "fs/promises";
import path from "path";

// Caminho para seu ícone base (SVG)
const MASTER_ICON_PATH = "assets/logo.svg"; // ajuste se necessário
const OUTPUT_PATH = "public/icons";

async function run() {
  const imageAdapter = await getNodeImageAdapter();

  const masterIcon: MasterIcon = {
    icon: await loadAndConvertToSvg(MASTER_ICON_PATH),
  };

  const faviconSettings: FaviconSettings = {
    icon: {
      desktop: {
        regularIconTransformation: {
          type: IconTransformationType.None,
        },
        darkIconType: "regular",
        darkIconTransformation: {
          type: IconTransformationType.None,
        },
      },
      touch: {
        transformation: {
          type: IconTransformationType.None,
        },
        appTitle: "ConectIgreja",
      },
      webAppManifest: {
        transformation: {
          type: IconTransformationType.None,
        },
        backgroundColor: "#ffffff",
        themeColor: "#ffffff",
        name: "ConectIgreja",
        shortName: "Igreja",
      },
    },
    path: "/icons",
  };

  const files = await generateFaviconFiles(masterIcon, faviconSettings, imageAdapter);

  // 🔧 Criar pasta se não existir
  await fs.mkdir(OUTPUT_PATH, { recursive: true });

  for (const file of files) {
    const filePath = path.join(OUTPUT_PATH, file.name);
    await fs.writeFile(filePath, file.contents);
    console.log(`✅ Gerado: ${file.name}`);
  }

  const html = await generateFaviconHtml(faviconSettings);
  await fs.writeFile("public/icons/favicon-snippets.html", html.join("\n"));
  console.log("✅ HTML de inclusão gerado: favicon-snippets.html");
}

run().catch(console.error);
