import Cache from "file-system-cache"

const cache = Cache({
	basePath: "./.cache",
	ns: "my-namespace",
	hash: "sha1",
})

export default cache
