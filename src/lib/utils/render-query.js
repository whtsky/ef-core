import ARR from './array-helper.js'

const query = []
const domQuery = []
const userQuery = []
let count = 0

const queue = handlers => query.push(...handlers)
const queueDom = handler => domQuery.push(handler)
const onNextRender = handler => userQuery.push(handler)

const inform = () => {
	count += 1
	return count
}

const execModifications = () => {
	const renderQuery = ARR.unique(query)
	for (let i of renderQuery) i()
	if (process.env.NODE_ENV !== 'production') console.info('[EF]', `${query.length} modification operation(s) cached, ${renderQuery.length} executed.`)
	ARR.empty(query)
}

const execDomModifications = () => {
	const domRenderQuery = ARR.rightUnique(domQuery)
	for (let i of domRenderQuery) i()
	if (process.env.NODE_ENV !== 'production') console.info('[EF]', `${domQuery.length} DOM operation(s) cached, ${domRenderQuery.length} executed.`)
	ARR.empty(domQuery)
}

const execUserQuery = () => {
	if (userQuery.length === 0) return
	const userFnQuery = ARR.unique(userQuery)
	for (let i of userFnQuery) i()
	if (process.env.NODE_ENV !== 'production') console.info('[EF]', `${userQuery.length} user operation(s) cached, ${userFnQuery.length} executed.`)
	ARR.empty(userQuery)
}

const exec = (immediate) => {
	if (!immediate && (count -= 1) > 0) return count
	count = 0

	if (query.length > 0) execModifications()

	if (domQuery.length > 0) execDomModifications()

	// Execute user query after DOM update
	if (userQuery.length > 0) setTimeout(execUserQuery, 0)

	return count
}

const bundle = (cb) => {
	inform()
	return exec(cb(inform, exec))
}

export { queue, queueDom, onNextRender, inform, exec, bundle }
