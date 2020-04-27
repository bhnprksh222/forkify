import Search from '../models/Search';
import * as searchView from '../views/searchView';
import {elements, renderLoader, clearLoader} from '../views/base';

/*
    Global state of hte app
    *- search object
    *- current recipe object
    *- shopping list object
    *- liked recipes
*/
const state = {};

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

        // 4) search for recipes
        await state.search.getResults();

        // 5) render results on UI
        clearLoader();
        searchView.renderResults(state.search.result);

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