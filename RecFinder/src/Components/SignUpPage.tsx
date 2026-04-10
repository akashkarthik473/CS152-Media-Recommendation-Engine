import '../Stylesheets/SignUpPage.css';

function SignUpPage(){
    return(
        <div className="page">
            <div className="card">
                <h2>Create Account</h2>

                <form>
                    <label>Username</label>
                    <input type="text" placeholder="Enter username" />

                    <label>Email</label>
                    <input type="email" placeholder="Enter email" />

                    <label>Password</label>
                    <input type="password" placeholder="Enter password" />

                    <button type="submit">Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default SignUpPage;