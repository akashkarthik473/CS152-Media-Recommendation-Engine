import '../Stylesheets/Homepage.css'
import { useState } from 'react';

const BASE_URL = 'http://127.0.0.1:8000';

function Homepage() {
    const [error, setError] = useState();
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [recs, setRecs] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true);

        try{
            const response = await fetch(`${BASE_URL}/recommend`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query:query,
                    media_type: "any",
                }),
            });

            const data = await response.json();
            setRecs(data.recommendations)
        } catch (err: any){
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    if(loading){
        return <h3>Generating Recommendations</h3>
    }
    if(error){
        return <h3>Response Failed to Generate</h3>
    }
    return (
        <div className='page'>
            <h1>RecFinder</h1>
            <h3>A one stop shop for any recommendations you might need</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type='text'
                    placeholder='enter the names of your favorite media'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button type='submit'>Find Recommendations</button>
            </form>
            {recs && (
                <div>
                    <h3>Recommendations:</h3>
                     <p>{recs}</p>
                </div>
            )}
        </div>
    )
}

export default Homepage