import Search from '../models/Search';
import Recipe from '../models/Recipe';
import * as searchView from '../views/searchView';
import * as recipeView from '../views/recipeView';
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
    console.log(query);
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
    console.log(id);

    if (id) {
        //* Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //* Create new recipe object
        state.recipe = new Recipe(id);
        
        try {
            //* get recipe data and parse ingredients
            await state.recipe.getRecipe();
            console.log(state.recipe.ingredients);
            state.recipe.parseIngredients();

            //* calculate servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();

            //* Render recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe); 

        } catch (err) {
            console.log(err);
            console.log('Error processing recipe!');
        }
        
    }
};

//* addEventListener with multiple arguements
// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));
