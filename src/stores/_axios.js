import axios from 'axios'

const axGet=(url,params)=>{
    return axios.get('http://localhost:3000/'+url,{params: params})
        .then((e)=>{return e.data})
}
const axPost=(url,data)=>{
    return axios.post('http://localhost:3000/'+url,data)
}
const axPatch=(url,data)=>{
    return axios.patch('http://localhost:3000/'+url,data)
}
const axRefreshId=async (url)=>{
    const awaitingObject=await axGet(url)
    const newId=awaitingObject.lastId+1
    await axPatch(url,{lastId:newId})
    return newId
}

export {axGet,axPost,axPatch,axRefreshId}