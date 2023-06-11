const login = async (email, password)=>{
    try {
        const result = await axios({
            method:'POST',
            url: 'http://localhost/api/v1/users/login',
            withCredentials:true,
            data:{
                email, password, withCredentials: true
            }
        })
    
        console.log('result', result)
        
    } catch (error) {
        console.log('result error', error)
    }
}

document.querySelector('.form').addEventListener('submit',e=>{
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value
    login(email, password)
    // alert(email, password)
})