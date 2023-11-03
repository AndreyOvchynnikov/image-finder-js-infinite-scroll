import './sass/main.scss'
import { getRequest } from './js/pixabayApi'
import { createHitMarkup } from './js/createHitMarkup';
import { scrollBy } from './js/scrollBy';
import { message } from './js/messages';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';


const formRef = document.querySelector('#search-form');
const galleryRef = document.querySelector('.gallery');


formRef.addEventListener('submit', onSearch)
galleryRef.addEventListener('click', onClickOnImage)

const gallery = new SimpleLightbox('.gallery a');
const responcePerPage = 40

const observer = new IntersectionObserver(async entries => {

    const lastCard = entries[0]
    if (!lastCard.isIntersecting) {
        return
    } 
    const queryParams = JSON.parse(sessionStorage.getItem('queryParams'))

    if (queryParams.totalHits - queryParams.page * responcePerPage <= 0) {
            message.noMoreResultsMessage();
            return;
    }
    await onObserve()
    observer.unobserve(lastCard.target);
    observer.observe(document.querySelector('.photo-card:last-child'));
}, {
    rootMargin: '200px',    
})
     
async function onSearch(event) {
    event.preventDefault()
    galleryRef.innerHTML = '';

    const { searchQuery } = event.currentTarget.elements;
    const queryParams = {
        query: searchQuery.value,
        page: 1,
        totalHits: 0,
    }
    
    const requestResult = await getRequest(queryParams.query, queryParams.page)
    const { totalHits, hits } = requestResult;
    queryParams.totalHits = totalHits;

    sessionStorage.setItem('queryParams', JSON.stringify(queryParams));

    if (totalHits === 0) {
        message.notResultsMessage();
            return
    }
    message.resultsQuantityMessage(totalHits);
    galleryRef.insertAdjacentHTML('beforeend', createHitMarkup(hits));
    scrollBy(0.15)
    gallery.refresh();
    observer.observe(document.querySelector('.photo-card:last-child'));
}

function onClickOnImage(event) {
    event.preventDefault()
    if (!event.target.classList.contains("photo-img")) {
    return
    }
    gallery.open(event.target);
}

async function onObserve() {
    const queryParams = JSON.parse(sessionStorage.getItem('queryParams'))
    queryParams.page += 1
    sessionStorage.setItem('queryParams', JSON.stringify(queryParams));

    const requestResult = await getRequest(queryParams.query, queryParams.page)
    const { totalHits, hits } = requestResult;

    galleryRef.insertAdjacentHTML('beforeend', createHitMarkup(hits));
    gallery.refresh();
}

