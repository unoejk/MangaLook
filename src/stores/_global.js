const toCamelCase=(string)=>{
    const stringsArray=string.split(' ')
    let result=stringsArray[0].toLowerCase()
    if (stringsArray.length>1){
        stringsArray.splice(0,1)
        stringsArray.forEach(val=>{
            result=result+val.charAt(0).toUpperCase()+val.slice(1).toLowerCase()
        })
    }
    return result
}
const toCapitalizeFirst=(string)=>{
    return string.charAt(0).toUpperCase()+string.slice(1).toLowerCase()
}
const deepClone=(target)=>{
    if (target===null){
        return null
    }
    if (Array.isArray(target)){
        const newArray=Array(0)
        for (let num in target){
            newArray.push(deepClone(target[num]))
        }
        return newArray
    }
    if (typeof target==='object'){
        const newObject=Object.create(Object.prototype)
        for (let name in target){
            newObject[name]=deepClone(target[name])
        }
        return newObject
    }
    return target
}
const numToDashString=(num)=>{
    return num.toString().replace('.','-')
}
const dashStringToNum=(dashString)=>{
    return Number(dashString.replace('-','.'))
}

export {toCamelCase,toCapitalizeFirst,deepClone,numToDashString,dashStringToNum}