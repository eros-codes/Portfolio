export function generatePersonSchema() {
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		"@id": "https://aboutarvin.ir/#person",
		name: "Arvin Saghafi",
		url: "https://aboutarvin.ir/",
		jobTitle: "Backend-focused Software Developer",
		description:
			"Arvin Saghafi is a backend-focused software developer and Computer Engineering student specializing in backend development, API development, database design, and scalable software systems.",
		knowsAbout: [
			"Backend Development",
			"Software Engineering",
			"REST API Development",
			"Database Design",
			"Node.js",
			"JavaScript",
			"React",
			"NestJS",
			"Java",
			"C#",
			"C++",
			"Python",
			"SQL",
			"Git",
		],
		affiliation: {
			"@type": "CollegeOrUniversity",
			name: "Tabriz University",
		},
		sameAs: ["https://github.com/eros-codes"],
	};
}
