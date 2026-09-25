export function generateFAQSchema() {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		"@id": "https://www.aboutarvin.ir/#faq",
		mainEntity: [
			{
				"@type": "Question",
				name: "Who is Arvin Saghafi?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Arvin Saghafi is a backend-focused software developer and Computer Engineering student specializing in backend systems, API development, database design, and scalable software solutions.",
				},
			},
			{
				"@type": "Question",
				name: "What technologies does Arvin Saghafi use?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Arvin Saghafi works with technologies including Node.js, NestJS, PostgreSQL, JavaScript, React, Java, C#, C++, Python, SQL, and Git.",
				},
			},
			{
				"@type": "Question",
				name: "What projects has Arvin Saghafi built?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Arvin Saghafi has developed software projects including Rivo, Shop, Reservation, and Bank using modern backend, web, and desktop technologies.",
				},
			},
			{
				"@type": "Question",
				name: "What is Rivo developed by Arvin Saghafi?",
				acceptedAnswer: {
					"@type": "Answer",
					text: "Rivo is a real-time web application developed by Arvin Saghafi using Node.js, PostgreSQL, Socket.IO, and HashiCorp Vault with secure messaging and encryption features.",
				},
			},
		],
	};
}
