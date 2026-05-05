import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Alert } from "../components/ui/Alert";
import { Select } from "../components/ui/Select";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { mediaListStorage } from "../lib/storage";
import { mediaApi } from "../api/media";
import type { Media } from "../types"
import "./HomePage.css";
import "./MediaPage.css";

//creates a type to enforce the valid strings mediaType can be
type MediaType = "movie" | "tv" | "book" | "game";

//maps internal mediaType values to the displayed values seen in the popup
const MEDIA_OPTIONS: { value: MediaType; label: string }[] = [
    { value: "movie", label: "Movies" },
    { value: "tv", label: "TV Shows" },
    { value: "book", label: "Books" },
    { value: "game", label: "Games" },
  ];

/*
* Purpose: reutnrs html page to be displayed and holds the functions it uses
* Input: None 
* Output: html page
*/
export function MediaListPage(){
    const { user } = useAuth(); //holds user information
    const [showModal, setShowModal] = useState(false); //keeps track of if the popup window is opend or closed
    const [modalQuery, setModalQuery] = useState(""); //holds the search query in the popup window
    const [modalResults, setModalResults] = useState([]); //holds the results of the search query
    const [modalLoading, setModalLoading] = useState(false); //keeps track of if the search bar is loading new results
    const [selectedMediaType, setSelectedMediaType] = useState<MediaType>("movie"); //keeps track of media type your seraching for
    const [modalError, setModalError] = useState<string | null>(null); //holds error message if search fails
    const [selectedItems, setSelectedItems] = useState<Media[]>([]) //stores array of media objects 


    /*
    * Purpose: on load gets previously inputed media from local storage and displays it
    * Input: None 
    * Output: None
    */
    useEffect(() => {
        //get previously input data from local storage
        const stored = mediaListStorage.get();

        //if stored is null or not and array exits immediately 
        if (!stored || !Array.isArray(stored)) return; 
        
        setSelectedItems(stored)
        
    }, [user]); //runs effect when a change happens to this variable

    /*
    * Purpose: Opens the search popup 
    * Input: a mediaType variable 
    * Output: None
    */
    const openModal = (mediaType: MediaType) => {
        setSelectedMediaType(mediaType); //sets select button to inputed media type
        setModalQuery(""); // Reset search query when switching media types
        setModalResults([]); // Clear previous results
        setModalError(null); // Clear any previous modal error
        setShowModal(true);
    };

    /*
    * Purpose: Adds an item to selected item to be displayed and stores it in the database
    * Input: an item object
    * Output: None
    */
    const addSelectedItem = async (item: any) => {
        if (!user) return;

        //Stores title, subtitle, and poster path taking into account different variable names from the API
        const title = item.title || item.name || item.original_title || item.original_name || item.volumeInfo?.title || "Untitled";
        const subtitle = item.release_date || item.first_air_date || item.released || item.volumeInfo?.publishedDate || "";
        const posterPath = item.poster_path || item.background_image || item.volumeInfo.imageLinks?.thumbnail;

        // checks each object in the selctedItems Array to see if at least one returns true and if it does returns true otherwise returns false
        const alreadyExists = selectedItems.some((saved) => {
            //checks if the current item is equal to another item in the array
            if (item.id != null && saved.id === item.id) return true; 

            //if id check fails checks if title, subtitle, and mediaType match and returns the result
            return (
                saved.title === title &&
                saved.subtitle === subtitle &&
                saved.mediaType === selectedMediaType
            );
        });

        //checks if duplicates alread exist if they do then return
        if(alreadyExists) {
            setModalError("can't add duplicate items")
        }

        //saves item to databsae and adds it to selected items, if db save fails doesnt add it to selcted items
        try{
            //Saves new item to the database
            const created = await mediaApi.addMedia({
                user_id: user.id,
                mediaType: selectedMediaType,
                title: title,
                subtitle: subtitle,
                posterPath: posterPath,
            })

            //creates a new media object to add to selectedItems
            const newItem: Media = {
                id: created.id,
                user_id:  user.id,
                mediaType: selectedMediaType,
                title,
                subtitle,
                posterPath: posterPath ?? null
            }

            //spreads the selectedItems array and adds newItem to the end and stores the copy in updated
            const updated = [...selectedItems,newItem]

            //sets new array to selectedItems and stores it in local storage
            setSelectedItems(updated)
            mediaListStorage.set(updated)
   
        } catch (err){
            console.error("Failed to save media to database:", err);
        }

        //after item is added clears popup and closes it
        setShowModal(false);
        setModalQuery("");
        setModalResults([]);
    };

    /*
    * Purpose: Deletes media from selectedItems and stops displaying it
    * Input: an itemID
    * Output: returns updated selectedItems array
    */
    const deleteSelectedItem = async (itemId: number) => {
        try{
            //deletes media item from databse
            await mediaApi.deleteMedia(itemId)

            //updates selected item by filtering out the item using its item id and storing it in local storage
            setSelectedItems((prev) => {
                const updated = prev.filter((item) => item.id !== itemId)
                mediaListStorage.set(updated)

                //returns setSelectedItems new callback state
                return updated
            });
        } catch(err) { //catches database error so if delte fails item isnt delted
            console.error("Failed to save media to database", err)
        }
    };

    /*
    * Purpose: Calls the appropriate api to grab search results from and dispalys them
    * Input: None
    * Output: None
    */
    useEffect(() => {
        //if the searchbar in the pop up is empty clears the error and results and returns
        if(!modalQuery.trim()){
            setModalResults([]);
            setModalError(null); 
            return;
        }

        const timeout = setTimeout(async () => {
            setModalLoading(true);
            setModalError(null); // Clear error when starting new search
            try {
                // Only fetch data from TMDB API for movies and TV shows
                if (selectedMediaType === "movie" || selectedMediaType === "tv") {
                    const endpoint = selectedMediaType === "movie" ? "movie" : "tv";
                    const search = await fetch(
                        `https://api.themoviedb.org/3/search/${endpoint}?query=${encodeURIComponent(modalQuery)}&api_key=${import.meta.env.VITE_TMDB_API_KEY}`
                    );

                    //stores data in json and sets the modal query results to data.results
                    const data = await search.json();
                    setModalResults(data.results || []);
                  // Fetch datat from the RAWG API for games
                } else if (selectedMediaType === "game") {
                    const search = await fetch(
                        `https://api.rawg.io/api/games?search=${encodeURIComponent(modalQuery)}&key=${import.meta.env.VITE_RAWG_API_KEY}`
                    );
                    const data = await search.json();
                    setModalResults(data.results || []);
                  // Fetch data from the Google Books API for books
                } else if (selectedMediaType === "book"){
                    const search = await fetch(
                        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(modalQuery)}&orderBy=relevance&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
                    );
                    const data = await search.json();
                    setModalResults(data.items || []);
                }
            } catch (error) { //if an error occurs print a message to console and clear modal reuslts
                console.error("Search error:", error);
                setModalResults([]);
            }
            setModalLoading(false);
        }, 400); //wait 400ms before searching

        //cancels search if user types again in 400ms
        return () => clearTimeout(timeout);
    }, [modalQuery, selectedMediaType]); //runs effect everytime a change happens to one of these

   return(
       <div className="home">
        <header className="home__hero">
            <h1 className="home__title">
                {user ? `Welcome ${user.username}` : "Record your favcortie media"}
            </h1>
            <p className="home__subtitle">
                List your favorite media from each category to help our engine better serve you
            </p>
        </header>

        <div className="media-div">
            <h2>Movies</h2>
            <div className="media">
                <div className="add-media-box" onClick={() => openModal("movie")}>
                    <span className="add-media-icon">+</span>
                </div>                
                {selectedItems.filter((item) => item.mediaType === "movie") 
                .map((item) =>(
                  <div key={item.id} className="media-card" onClick={() => deleteSelectedItem(item.id)}>
                    {item.posterPath ? (
                      <img src={`https://image.tmdb.org/t/p/w185${item.posterPath}`} alt={item.title} />
                    ) : (
                      <div className="media-card__placeholder">No image</div>
                    )}
                    <div className="media-card__title">{item.title}</div>
                  </div>
                ))}            
            </div>

            <h2>TV Shows</h2>
            <div className="media">
                <div className="add-media-box" onClick={() => openModal("tv")}>
                    <span className="add-media-icon">+</span>
                </div>                
                {selectedItems.filter((item) => item.mediaType === "tv") 
                .map((item) =>(
                  <div key={item.id} className="media-card" onClick={() => deleteSelectedItem(item.id)}>
                    {item.posterPath ? (
                      <img src={`https://image.tmdb.org/t/p/w185${item.posterPath}`} alt={item.title} />
                    ) : (
                      <div className="media-card__placeholder">No image</div>
                    )}
                    <div className="media-card__title">{item.title}</div>
                  </div>
                ))}            
            </div>

            <h2>Books</h2>
            <div className="media">
                <div className="add-media-box" onClick={() => openModal("book")}>
                    <span className="add-media-icon">+</span>
                </div>                
                {selectedItems.filter((item) => item.mediaType === "book") 
                .map((item) =>(
                  <div key={item.id} className="media-card" onClick={() => deleteSelectedItem(item.id)}>
                    {item.posterPath ? (
                      <img src={item.posterPath} alt={item.title} />
                    ) : (
                      <div className="media-card__placeholder">No image</div>
                    )}
                    <div className="media-card__title">{item.title}</div>
                  </div>
                ))}            
            </div>

            <h2>Games</h2>
            <div className="media">
                <div className="add-media-box" onClick={() => openModal("game")}>
                    <span className="add-media-icon">+</span>
                </div>                
                    {selectedItems.filter((item) => item.mediaType === "game") 
                    .map((item) =>(
                        <div key={item.id} className="media-card" onClick={() => deleteSelectedItem(item.id)}>
                    {   item.posterPath ? (
                        <img src={item.posterPath} alt={item.title} />
                        ) : (
                            <div className="media-card__placeholder">No image</div>
                        )}
                        <div className="media-card__title">{item.title}</div>
                    </div>
                    ))}            
                </div>
            </div>

        {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <h2>Add Media</h2>
                    
                    <div className="modal-search">
                        <Select
                            value={selectedMediaType}
                            onChange={(e) => setSelectedMediaType(e.target.value as MediaType)}
                            options={MEDIA_OPTIONS}
                        />
                        <Input
                            type="text"
                            placeholder={`Search for ${selectedMediaType}...`}
                            value={modalQuery}
                            onChange={(e) => setModalQuery(e.target.value)}
                        />
                    </div>

                    {modalError && (
                        <div className="modal-feedback">
                            <Alert variant="error">{modalError}</Alert>
                        </div>
                    )}

                    {modalLoading && <div className="modal-loading">Searching...</div>}

                    <div className="modal-results">
                        {modalResults.slice(0, 10).map((item: any) => (
                            <div key={item.id} className="modal-result-item">
                                <div className="result-info">
                                    <h4>{item.title || item.name || item.volumeInfo?.title || item.original_title || item.original_name}</h4>
                                    <p>{item.release_date || item.first_air_date || item.released || item.volumeInfo?.publishedDate ? 
                                        new Date(item.release_date || item.first_air_date || item.released || item.volumeInfo?.publishedDate).getFullYear() : 
                                        'N/A'}</p>
                                </div>
                                <Button size="sm" onClick={() => addSelectedItem(item)}>Add</Button>
                            </div>
                        ))}
                        {modalQuery && !modalLoading && modalResults.length === 0 && (
                            <p className="no-results">No results found</p>
                        )}
                    </div>

                    <div className="modal-actions">
                        <Button onClick={() => setShowModal(false)}>Close</Button>
                    </div>
                </div>
            </div>
        )}
        </div>
   )
}

