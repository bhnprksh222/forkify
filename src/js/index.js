import Search from '../models/Search';
import Recipe from '../models/Recipe';
import List from '../models/List';
import Likes from '../models/Likes';
import * as searchView from '../views/searchView';
import * as recipeView from '../views/recipeView';
import * as listView from '../views/listView';
import * as likesView from '../views/likesView';
import {elements, renderLoader, clearLoader} from '../views/base';

/*
    Global state of hte app
    *- search object
    *- current recipe object
    *- shopping list object
    *- liked recipes
*/
const state = {};

//! Search controller

const controlSearch = async () => {
    // 1) get query from view
    const query = searchView.getInput(); 
    if(query) {
        // 2) new search object added to state
        state.search = new Search(query);

        // 3) prepare UI for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            // 4) search for recipes
            await state.search.getResults();

            // 5) render results on UI
            clearLoader();
            searchView.renderResults(state.search.result);
        } catch (err) {
            alert('Something wrong with the search...');
            clearLoader();
        }
        

    }
}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});



elements.searchResPages.addEventListener('click', e => {
    const btn = e.target.closest('.btn-inline');
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResults();
        searchView.renderResults(state.search.result, goToPage);
    }
});


//! Recipe controller

const controlRecipe = async () => {
    //* get ID from url
    const id = window.location.hash.replace('#', '');

    if (id) {
        //* Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //* Highlight selected search item
        if(state.search) searchView.highlightSelected(id);

        //* Create new recipe object
        state.recipe = new Recipe(id);
        
        try {
            //* get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //* calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //* Render recipe
            clearLoader();
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)    
            ); 

        } catch (err) {
            console.log(err);
            alert('Error processing recipe!');
        }
        
    }
};

//* addEventListener with multiple arguements
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));



//! List controller
const controlList= () => {
    // create an new list IF there is none yet
    if(!state.list) state.list  = new List();

    //Add each ingredient to the list and UI
    state.recipe.ingredients.forEach((el) => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });
}

// handle delete and update list item events
elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;

    //Handle the delete button
    if( e.target.matches('.shopping__delete, .shopping__delete *') ) {
        // delete from state
        state.list.deleteItem(id);

        // delete from UI
        listView.deleteItem(id);

        //handle the count update
    } else if(e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value);
        state.list.updateCount(id, val);
    }
});


//! Likes controller
const controlLike= () => {
    if (!state.likes) state.likes = new Likes();
    const currentID = state.recipe.id;
    
    // User has not yet liked curent recipe
    if(!state.likes.isLiked(currentID)) {
        // Add like to the state
        const newLike =  state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Toggle the like button
        likesView.toggleLikeBtn(true);

        // Add like ot UI list  
        likesView.renderLike(newLike);
        
    // User has the current recipe
    } else {
        // Remove like to the state
        state.likes.deleteLike(currentID);

        // Toggle the like button
        likesView.toggleLikeBtn(false);

        // Remove like ot UI list  
        likesView.deleteLike(currentID);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};

//! Restore liked recipes on page load
window.addEventListener('load', () => { // use onload
    state.likes = new Likes();

    // Restore likes
    state.likes.readStorage();

    // Toggle like menu button
    likesView.toggleLikeMenu(state.likes.getNumLikes());

    // Render the existing likes
    state.likes.likes.forEach(like => likesView.renderLike(like));
    // for (const like of state.likes.likes) {
    //     likesView.renderLike(like);
    // }
});


// Handling recipe button clicks
elements.recipe.addEventListener('click', e => {
    if (e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button is clicked
        if(state.recipe.servings > 1)
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);

    } else if (e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    } else if (e.target.matches('.recipe__btn--add, .recipe__btn-add *')) {
        // Add ingredients to shopping list
        controlList();
    } else if (e.target.matches('.recipe__love, .recipe__love *')) {
        //! LIKE CONTROLLER    
        controlLike();
    }
});


