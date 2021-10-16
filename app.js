const form = document.querySelector('#form')
const searchInput = document.querySelector('#search')
const songsContainer = document.querySelector('#songs-container')
const prevAndNextContainer = document.querySelector('#prev-and-next-container')

const apiUrl = `https://api.lyrics.ovh`

const fetchData = async (url) => {
  const response = await fetch(url)
  return await response.json()
}

const fetchSongs = async (term) => {
  const data = await fetchData(`${apiUrl}/suggest/${term}`)
  insertSongsIntoPage(data)
}

const getMoreSongs = async (url) => {
  const data = await fetchData(url)
  insertSongsIntoPage(data)
}

const insertNextAndPrevButtons = ({ prev, next }) => {
  prevAndNextContainer.innerHTML = `
      ${prev ? `<button class="btn" onClick='getMoreSongs("${prev}")'>Anteriores</button>` : ''}
      ${next ? `<button class="btn" onClick='getMoreSongs("${next}")'>Próxima</button>` : ''}`
}

const insertSongsIntoPage = ({ data, next, prev }) => {
  songsContainer.innerHTML = data.map(({ artist: { name }, title }) => `
      <li class="song">
          <span class="song-artist"> <strong>${name}</strong> ${title}</span>
          <button class="btn" data-artist="${name}" data-song-title="${title}">Ver Letra</button>
      </li>`
  ).join('')



  if (prev || next) {
    insertNextAndPrevButtons({ prev, next })
    return
  }

  prevAndNextContainer.innerHTML = ''
}

const insertLyricsIntoPage = ({ lyrics, artist, songTitle }) => {
  return (songsContainer.innerHTML = `
	<li class="lyrics-container">
		<h2><strong>${songTitle}</strong> - ${artist}</h2>
    <p class="lyrics">${lyrics}</p>
	</li>
	`)
}

const fetchLyrics = async (artist, songTitle) => {
  const data = await fetchData(`${apiUrl}/v1/${artist}/${songTitle}`)
  if (!data.error) {
    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>')
    insertLyricsIntoPage({ lyrics, artist, songTitle })
    return
  }
  songsContainer.innerHTML = `<p class="warning-message">Nao há letra disponivel para esta musica</p>`

}

const handleSongsContainerCLick = (event) => {
  event.preventDefault()

  const searchTerm = searchInput.value.trim()
  if (!searchTerm) {
    songsContainer.innerHTML = `<p class="warning-message">Por favor digite um termo valido</p>`
    prevAndNextContainer.innerHTML = ''
    return
  }
  fetchSongs(searchTerm)
    .then(r => {
      searchInput.value = ""
      searchInput.focus()
    })

}

const handleFormSubmit = (event) => {
  const clickedElement = event.target
  if (clickedElement.tagName === 'BUTTON') {
    const artist = clickedElement.getAttribute('data-artist')
    const songTitle = clickedElement.getAttribute('data-song-title')
    prevAndNextContainer.innerHTML = ''
    fetchLyrics(artist, songTitle)

  }
}

form.addEventListener('submit', handleSongsContainerCLick)
songsContainer.addEventListener('click', handleFormSubmit)
