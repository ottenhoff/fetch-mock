export function simpleMethods(fetchMockVariableName, root, j) {
	const fetchMockMethodCalls = root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: fetchMockVariableName,
				},
			},
		})
		.map((path) => {
			const paths = [path];
			while (path.parentPath.value.type !== 'ExpressionStatement') {
				path = path.parentPath;
				if (path.value.type === 'CallExpression') {
					paths.push(path);
				}
			}
			return paths;
		});

	fetchMockMethodCalls.forEach((path) => {
		const method = path.value.callee.property.name;
		if (method === 'mock') {
			path.value.callee.property.name = 'route';
		}
	});
	const lastUrl = root
		.find(j.CallExpression, {
			callee: {
				object: {
					type: 'Identifier',
					name: fetchMockVariableName,
				},
				property: {
					name: 'lastUrl',
				},
			},
		})
		.closest(j.ExpressionStatement);

	lastUrl.replaceWith((path) => {
		const oldCall = j(path).find(j.CallExpression).get();
		const builder = j(`${fetchMockVariableName}.callHistory.lastCall()?.url`);
		const newCall = builder.find(j.CallExpression).get();
		newCall.value.arguments = oldCall.value.arguments;
		return builder.find(j.ExpressionStatement).get().value;
	});
}
