function createElement(tag, parent, cb) {
    const e = document.createElement(tag)
    if (parent) parent.append(e)
    if (cb) cb(e)
    return e
}
window.createParentedElement = createElement
window.convert = (stmbl) => {
    const parser = new DOMParser()
    const doc = parser.parseFromString(stmbl, "application/xml")
    window.currentlyParsed = doc
    console.log(doc)
    if (doc.querySelector("parsererror")) return doc.querySelector("parsererror").outerHTML
    // function findFirstElementWhichIsA(tag) {
    // const elements = doc.documentElement.getElementsByTagName(tag)
    // if (!elements) return
    // return elements.item(0)
    // }
    function forEachElementWhichIsA(tag, cb) {
        const elements = doc.documentElement.getElementsByTagName(tag)
        if (!elements) return false
        const elmn = []
        for (let i = 0; i < elements.length; i++) {
            elmn.push({ e: elements.item(i), ind: i })
        }
        elmn.forEach(obj => {
            cb(obj.e, obj.ind)
        })
    }
    function removeAll(tag) {
        forEachElementWhichIsA(tag, (element) => {
            element.remove()
        })
    }
    const docElement = doc.documentElement
    if (!docElement) return "MissingDocumentTag:: []"
    if (docElement.tagName != "document") return "MissingDocumentTag:: []"
    const docType = docElement.getAttribute("isa")
    switch (docType) {
        case "sfv1": {
            removeAll("title")
            forEachElementWhichIsA("head", (element) => {
                const head = document.createElement("div")
                element.before(head)
                head.innerHTML = element.innerHTML
                element.getAttributeNames().forEach(att => {
                    head.setAttribute(att, element.getAttribute(att))
                })
                head.style.position = "absolute"
                head.style.left = "0px"
                head.style.top = "0px"
                if (head.style.width == "") head.style.width = "100%"
                if (head.style.height == "") head.style.height = "10%"
                element.remove()
            })
            forEachElementWhichIsA("arm", (element) => {
                const arm = document.createElement("div")
                element.before(arm)
                arm.innerHTML = element.innerHTML
                element.getAttributeNames().forEach(att => {
                    if (att != "side") arm.setAttribute(att, element.getAttribute(att))
                })
                arm.style.position = "absolute"
                if (element.getAttribute("side") == "right") {
                    arm.style.right = "0px"
                } else {
                    arm.style.left = "0px"
                }
                arm.style.top = "0px"
                if (arm.style.width == "") arm.style.width = "10%"
                if (arm.style.height == "") arm.style.height = "100%"
                element.remove()
            })
            forEachElementWhichIsA("foot", (element) => {
                const foot = document.createElement("div")
                element.before(foot)
                foot.innerHTML = element.innerHTML
                element.getAttributeNames().forEach(att => {
                    foot.setAttribute(att, element.getAttribute(att))
                })
                foot.style.position = "absolute"
                foot.style.left = "0px"
                foot.style.bottom = "0px"
                if (foot.style.width == "") foot.style.width = "100%"
                if (foot.style.height == "") foot.style.height = "10%"
                element.remove()
            })
            forEachElementWhichIsA("information", (element) => {
                const head = document.createElement("head")
                element.parentElement.prepend(head)
                head.innerHTML = element.innerHTML
                if (element.getAttribute("title")) createElement("title", head, e => {
                    e.innerHTML = element.getAttribute("title")
                })
                if (element.getAttribute("icon")) createElement("link", head, e => {
                    e.rel = "icon"
                    e.href = element.getAttribute("icon")
                })
                element.getAttributeNames().forEach(att => {
                    if (att != "title" && att != "icon") head.setAttribute(att, element.getAttribute(att))
                })
                element.remove()
            })
            return "<!DOCTYPE html>\n<html>" + docElement.innerHTML + "</html>"
        }
        default: return "UnknownDocumentType:: " + docType
    }
}