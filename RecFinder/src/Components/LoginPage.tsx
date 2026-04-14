import '../Stylesheets/SignUpPage.css';

function LoginPage(){
    return(
        <div className="page">
            <div className="card">
                <h2>Login</h2>

                <form>
                    <label>Username</label>
                    <input type="text" placeholder="Enter username" />

                    <label>Password</label>
                    <input type="password" placeholder="Enter password" />

                    <button type="submit">Login</button>
                </form>
            </div>
        </div>
    )
}

export default LoginPage;