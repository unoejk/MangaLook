// pinia
import {defineStore} from 'pinia'

// axios
import {axGet,axPost,axRefreshId} from './_axios.js'

export const useRegisterStore=defineStore({
    id:'registerStore',
    state:()=>({
        isLogged:false,
        loggedUser:null,
    }),
    actions:{
        async setLogged(bool, user){
            // try-catch написал только тут, так как пока не нужен, но чтобы потом не забыть
            try {
                this.isLogged=bool
                if (bool){
                    this.loggedUser=user
                    localStorage.setItem('user',JSON.stringify(user))
                }else {
                    this.loggedUser=null
                    localStorage.removeItem('user')
                }
            }catch (e) {
                console.log(e)
            }
        },
        async setLoggedFalseOnly(bool){
            // сделал отдельно эту функцию, только для того чтобы разлогинится и не экспортировать саму setLogged(),
            // через которую можно зайти, bool на вход и if-else уточнение оставил на всякий случай
            if (bool){
                console.log('this function only for LogOut, but u put TRUE here')
            }else {
                await this.setLogged(false)
            }
        },
        async tryLogged(login,password){
            let result=[]
            if (login.length<4){
                result.push('Длина login должна быть от 4 символов')
            }
            if (password.length<4){
                result.push('Длина password должна быть от 4 символов')
            }
            if (result[0]!==undefined){
                return result
            }
            let foundedUser=(await axGet('users/',{login:login,password:password}))[0]
            if (!foundedUser){
                // await возвращает массив с объектами где совпадут логин-пароль
                // если найдутся такие, его [0] будет объектом искомого юзера (true)
                // если нет, его [0] будет undefined (false)
                result.push('Неверный login или password')
                return result
            }
            await this.setLogged(true,foundedUser)
            return true
        },
        async tryAutoLogged(){
            const localSavedUser=await JSON.parse(localStorage.getItem('user'))
            if (localSavedUser){
                // если там что-то есть, то localSavedUser будет не null и запустится tryLogged
                await this.tryLogged(localSavedUser.login,localSavedUser.password)
            }
        },
        async tryRegister(email,login,password,confirmPassword){
            let result=[]
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
                result.push('Неверный email')
            }
            if (login.length<4){
                result.push('Длина login должна быть от 4 символов')
            }
            if (password.length<4){
                result.push('Длина password должна быть от 4 символов')
            }
            if (password!==confirmPassword){
                result.push('Не совпадают password и confirmPassword')
            }
            if (result[0]!==undefined){
                return result
            }
            if ((await axGet('users/',{email:email}))[0]){
                // await возвращает массив с объектами где совпадёт почта
                // если найдутся такие, его [0] будет объектом
                // если нет, его [0] будет undefined (false)
                result.push('Такой email уже занят')
            }
            if ((await axGet('users/',{login:login}))[0]){
                result.push('Такой login уже занят')
            }
            if (result[0]!==undefined){
                return result
            }
            const newUserId=await axRefreshId('users/0')
            await axPost('users/',{
                'id':newUserId,
                'email':email,
                'login':login,
                'password':password,
                'scores':[],
                'viewSettings':{}
            })
            return true
        },
    },
    getters:{
        getLoggedInfo(state){
            return {
                isLogged:state.isLogged,
                loggedUser:state.loggedUser
            }
        },
    },
})