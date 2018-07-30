
const vm = require('vm')

const templateTagReg = /\{\|.*?\|\}/g
const nakedReg = /\{\||\|\}|\s/g
const wrapReg = /\{\|\@.*?\|\}/g
const partReg = /\{\|\>.*?\|\}/g
const typeReg = /^[>&#^*@/]*/
const replaceMarke = '<|||>'
const nlMarke = '<|/|>'


// TODO::
// error checker
// change collection
// template functions
// parts {|> header|}
// wrapper {|@ html|} 


module.exports.init = (req, res, next) => {
    res.wbRender = (data) => {
        return render(res, data)
    }
    next()
}

function render(res, data) {
    let content = (data.content != null) ? data.content : ''
    const wraps = (data.wraps != null) ? data.wraps : {}
    const parts = (data.parts != null) ? data.parts : {}
    const params = (data.params != null) ? data.params : {}

    content = marge(content, wraps, parts)
    const separated = separate(content)
    // console.log('separated--->', separated)
    const builded = build(separated, params)
    // console.log('builded--->', builded)
    const compiled = compile(builded, params)
    // console.log('compiled--->', compiled)
    // return compiled        
    res.send(enLining(compiled))
}

// get marge
function marge(content, wraps, parts) {
    // change new line to mark
    content = lining(content)
    // insert wrap content
    const wrapTags = content.match(wrapReg)
    wrapTags.reverse()
    wrapTags.forEach(wrapTag => {
        // get wrap content
        const nakedTag = wrapTag.replace(nakedReg, '')
        const cleanTag = nakedTag.replace(typeReg, '')
        const wrapContent = lining(wraps[cleanTag])
        // ラッパーのコンテントの中に有るタグを検索
        const contentSideTags = wrapContent.match(wrapReg)
        contentSideTags.forEach(contentSideTag => {
            const contentSideNakedTag = contentSideTag.replace(nakedReg, '')
            const contentSideCleanTag = contentSideNakedTag.replace(typeReg, '')
            // クリーンしたラッパーのコンテントの中に有るタグが一致する場合
            if (contentSideCleanTag == cleanTag) {
                // コンテンツのタグを削除
                content = content.replace(wrapTag, '')
                // ラッパーコンテンツのタグをリプレイス
                content = wrapContent.replace(contentSideTag, content)
            }
        })
    })

    // insert part content
    const partTags = content.match(partReg)
    partTags.forEach(partTag => {
        nakedTag = partTag.replace(nakedReg, '')
        cleanTag = nakedTag.replace(typeReg, '')
        const partContent = lining(parts[cleanTag])
        content = content.replace(partTag, partContent)
    })

    return content
}

// get separate
function separate(string) {
    let line = lining(string)

    const matches = line.match(templateTagReg)

    let replaces = []
    for (let key in matches) {
        replaces[matches[key]] = `${replaceMarke}${matches[key]}${replaceMarke}`
    }

    for (let key in replaces) {
        const value = replaces[key]
        line = line.replace(regEscape(key, 'g'), value)
    }

    return line.split(replaceMarke)
}

// build
function build(matches, params) {
    const keys = '[' + Object.keys(params).join(',') + ']'
    let builded = `const ${keys} = values;\n`
    builded += `compiled = '';\n`

    matches.forEach((matche, key) => {
        // const matcheLine = matche.replace(/\r/g, '')
        if (matche.startsWith('{|')) {
            const cleared = matche.replace(nakedReg, '')
            let type = cleared.substr(0, 1)
            switch (type) {
                case '*':
                    body = cleared.substr(1)
                    var [array, variable] = body.split(':')
                    builded += `for(let key in ${array}) {\n`
                    builded += `${variable} = ${array}[key]\n`
                    break

                case '#':
                    body = cleared.substr(1)
                    var [variable, alias] = body.split(':')
                    builded += `if(${variable}){\n`
                    if (alias) {
                        builded += `const ${alias} = ${variable};\n`
                    }
                    break

                case '^':
                    body = cleared.substr(1)
                    var [variable, alias] = body.split(':')
                    builded += `if(!${variable}){\n`
                    if (alias) {
                        builded += `const ${alias} = ${variable};\n`
                    }
                    break

                case '/':
                    body = cleared.substr(1)
                    builded += `}\n`
                    break

                case '&':
                    body = cleared.substr(1)
                    builded += `compiled += ${body};\n`
                    break

                default:
                    body = cleared
                    builded += `compiled += entityify(${body});\n`
            }

        } else {
            builded += `compiled += '${matche}';\n`
        }
    })

    return builded
}

// compile
function compile(builded, params) {
    const values = Object.keys(params).map(prop => params[prop])
    const context = {
        compiled: '',
        values: values,
        entityify: entityify
    };
    vm.runInNewContext(builded, context)
    return context.compiled
}

// entityify
function entityify(string) {
    var chars = {
        '<': '&lt',
        '>': '&gt',
        '&': '&amp',
        '"': '&quot',
        '\'': '&#39'
    }

    return String(string).replace(/[<>'&"]/g, char => {
        return chars[char]
    })
}

function regEscape(str, option = null) {
    const escaped = str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
    if (option != null) {
        return new RegExp(escaped, option)
    }
    return new RegExp(escaped)
}

function lining(string) {
    string = string.replace(/\r/g, '')
    return string.replace(/\n/g, nlMarke)
}
function enLining(string) {

    return string.replace(regEscape(nlMarke, 'g'), '\n')
}