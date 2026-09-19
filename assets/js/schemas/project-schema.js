export function generateProjectSchema(projects) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": "https://aboutarvin.ir/#projects",
    name: "Arvin Saghafi Software Projects",
    itemListElement: projects.map((project) => ({
      "@type": "SoftwareApplication",
      name: project.folderName,
      description: project.description,
      ...(project.imageAddress && {
        image: `https://aboutarvin.ir/${project.imageAddress}`
      }),
      url: "https://aboutarvin.ir/#projects",
      applicationCategory: project.category,
      ...(project.operatingSystem && {
        operatingSystem: project.operatingSystem
      }),
      featureList: [...(project.features || []), ...(project.technologies || [])],
      author: {
        "@id": "https://aboutarvin.ir/#person"
      },
      keywords: project.keywords || []
    }))
  };
}

