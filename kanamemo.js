/**
 * Debugging related stuff
 */

/** @const {boolean} Adjust things for debugging? */
const DEBUG = false


/**
 * Quick & dirty way to throw errors.
 * @param {string} name - Error name.
 * @param {string} message - Error message.
 */
function raise(name, message) {
	console.log("Error: "+name)
	console.trace()
	throw message;
}

/**
 * Log a debug message. Will be prefixed with "[DEBUG]"
 * @param {string} message - Debug message to display.
 */
function debug(message) {
	console.log("[DEBUG] "+message)
}

/**
 * Suspend execution for a time. Prefix with await in an async function.
 * @param {number} timeout - For how many milliseconds execution should be suspended.
 * @returns {Promise} Resolves once the specified timeout has passed.
 */
function sleep(timeout) {
	return new Promise(resolve => window.setTimeout(resolve, timeout))
}

/**
 * Templates
 */

/**
 * HTML template for up facing tiles.
 * @const {function}
 * @param {string} id - ID for CSS matching.
 * @param {Object} skin - An object with a "background" attribute for the background image's URL.
 * @returns {string} HTML template literal.
 */
const HTML_UP_TILE_MARKUP = function(id, skin){
	return `
	<div id="${id}" class="tile" style="background-image: url(${skin.background});">
		<div class="tileCharacter">${skin.character}</div>
	</div>`
}

/**
 * HTML template for down facing tiles.
 * Will be showing pictograms no matter what if in DEBUG mode.
 * @const {function}
 * @param {string} id - ID for CSS matching.
 * @param {Object} skin - An object with a "background" attribute for the background image's URL.
 * @returns {string} HTML template literal.
 */
const HTML_DOWN_TILE_MARKUP = function(id, skin){
	if (DEBUG) {
		return `
		<div id="${id}" class="tile" style="background-image: url(${skin.background});">
			<div class="tileCharacter">${skin.character}</div>
		</div>`
	} else {
		return `
		<div id="${id}" class="tile" style="background-image: url(${skin.background});"></div>`
	}
}

/**
 * HTML template for matched tiles.
 * @const {function}
 * @param {string} id - ID for CSS matching.
 * @param {Object} skin - An object with a "background" attribute for the background image's URL.
 * @returns {string} HTML template literal.
 */
const HTML_MATCHED_TILE_MARKUP = function(id, skin){
	return `
	<div id="${id}" class="tile matched_tile" style="background-image: url(${skin.background});"></div>`
}

/**
 * Text template to construct the CSS tile ID for use in the tile HTML templates.
 * @const {function}
 * @param {string} id - The ID associated with the Tile object (value of Tile.prototype.id).
 * @returns {string} HTML template literal.
 */
const TILE_HANDLE=function(id){return `tile_${id}`}

/**
 * Class representing throwable errors.
 * @property  {Array} tags - Tags this error is supposed to be associated with.
 * @property {string} name - The error name (class name).
 * @property {string} message - The error message.
 */
class Error {
	/**
	 * Create an Error object.
	 * @param  {Array} tags - Tags this error is supposed to be associated with.
	 * @param {string} message - The error message.
	 */
	constructor(tags, message) {
		this.tags = []
		this.name = this.constructor.name
		this.message = message
		this.addTags(tags)
	}
	/**
	 * Tags available for the error in question.
	 * Subclasses are supposed to override/expand this with their own tags.
	 * @access protected
	 * @abstract
	 */
	get _availableTags() { return [] }
	
	/**
	 * Have any tags been specified for our error?
	 * @returns {boolean} true if there are any, false if not.
	 */
	get hasTags() {
		return (this.tags.length > 0)
	}
	
	/**
	 * Title of this error, with tags if it has any.
	 * @returns {string} Error title.
	 */
	get errorTitle() {
		if (this.hasTags) {
			return "Error: "+this.name+", tags: "+this.tags
		}
		else {
			return "Error: "+this.name
		}
	}
	
	/**
	 * Tag the error.
	 * @example error.addTag("TOMATO_IS_KETCHUP")
	 * @throws  - Will throw an error if the error doesn't recognize the tag.
	 * @param {string} - Tag name. Has to be one of the tags made available by the error.
	 */
	addTag(tag) {
		if (this.tagAvailable(tag)) {
			this.tags.push(tag)
		} else {
			console.log("Error: Error")
			console.trace()
			throw "Unknown error tag \""+tag+"\" specified for error (\""+this.name+"\"). Error message of the mistagged error: "+this.message
		}
	}
	
	/**
	 * Tag the error with multiple tags at once.
	 * @example error.addTags(["TOMATO_NOT_RESPONDING", "ANVIL_CEILING_FIXTURE_FAILURE"])
	 * @throws - Will throw an error if the error doesn't recognize one of the tags.
	 * @param {Array} tags - Tag names.
	 */
	addTags(tags) {
		for (let tag of tags) {
			this.addTag(tag)
		}
	}
	
	/**
	 * Do we know the specified tag?
	 * This evaluates whether the tag is on the list of tags this error recognizes.
	 * @param {string} tag - Tag name to be checked.
	 * @returns {boolean} true if it is, false if it's not.
	 */
	tagAvailable(tag) {
		if (this._availableTags.includes(tag)) {
			return true
		}
		else {
			return false
		}
	}
	
	/**
	 * Posts the error title and a trace to the console, and returns the error message.
	 * Intended to be used in conjuction with throw.
	 * @example throw error.embed()
	 * @example throw new TomatoError(["TOMATO_IS_KETCHUP", "Tomato go squashed by an anvil."]).embed()
	 * @returns {string} error message.
	 */
	embed() {
		console.log(this.errorTitle)
		console.trace()
		return this.message
	}
}

/**
 * File error.
 * @augments Error - Constructor remains unchanged.
 */
class FileError extends Error {
	
	/**
	 * Tags:
	 *  - NOT_FOUND: File not found.
	 * @protected
	 */
	get _availableTags() {
		return [...Error.prototype._availableTags, "NOT_FOUND"]
	}
}

/**
 * Subclass of Array that optionally takes an Array object. Provides additional functionality.
 * All methods return 'this' to allow chaining, unless the documentation says otherwise.
 * 
 */
class KanamemoArray extends Array {
	
	/**
	 * An Array subclass with additional functionality meeting the needs of Kanamemo.
	 * All methods return {this} to allow chaining.
	 * @param {anything} array - Empty for empty array or number for length, {Array} or {KanamemoArray} to initialize from.
	 * 
	 * Depending on the value of the array parameter, the initialization
	 * behaviour changes:
	 *  
	 *   If it's typechecked to be {undefined}", we get an empty array.
	 * 
	 *   Otherwise, if it typechecks to be {number}, we get an empty array
	 *   with a length equal to its value.
	 * 
	 *   Otherwise, if it's determined to be an {Array} or {KanamemoArray} object,
	 *   we initialize with the elements of the specified arrays.
	 * 
	 * @throws KanamemoArrayError Throws if none of the described cases for the array parameter apply.
	 * @todo Use proper {Error} subclass for KanamemoArrayError.
	 * 
	 */
	constructor(array) {
		// Make new, empty array?
		if (typeof(array) === "undefined") {
			super()
		// Make new array of specified size?
		} else if (typeof(array) === "number") {
			super(array)
		// Become a copy of the specified array?
		} else if (array.constructor === Array || array.isKanamemoArray) {
			super()
			array.forEach(element => { this.push(element) })
		// None of the above, which means something's wrong. Raise error.
		} else {
			raise("KanamemoArrayError", "KanamemoArray initialized with faulty parameter of type: "+typeof(array)+" and value "+array)
		}
		/** 
		 * This makes KanamemoArray objects recognize each other.
		 * @public
		 */
		this.isKanamemoArray = true
	} 
	
	/**
	 * Swap element A with element B.
	 * @param {number} indexA - Index to be swapped with indexB
	 * @param {number} IndexB - Index to be swapped with indexA
	 * @returns {this}
	 */
	swap (indexA, indexB) {
		let elementA = this[indexA]
		this[indexA] = this[indexB]
		this[indexB] = elementA
		return this
	}
	
	/**
	 * Randomize elements according to Fisher-Yates.
	 * @returns {this}
	 */
	shuffle() {
		if (this.length > 0) {
			let currentIndex = this.length
			while (currentIndex !== 0) {
				let randomIndex = Math.floor(Math.random()*currentIndex)
				--currentIndex;
				this.swap(currentIndex, randomIndex)
			}
		}
		return this
	}
	
	/**
	 * Initialize each index of the array with the index number.
	 * @example [1] would reference 1, [2] 2, etc. Stops when this.length is reached.
	 * returns {this}
	 */
	initWithIndices() {
		for (let i=0; i < this.length; i++) {
			this[i] = i
		}
		return this
	}
}

/**
 * Individual picture to be included in a set to be matched with others in it.
 * Contains information about it (e.g. educational in nature)
 * Example: The Japanese character に could have the info that it's a kana belonging
 * to the set of hiragana, and that it's derived  from the kanji 仁, which means
 * benevolence.
 * @todo
 */
class Pictogram {}

/**
 * Ties together pictograms that can be matched with each other.
 */
class PictogramSet extends KanamemoArray {
	
	/**
	 * Create a PictogramSet object.
	 * @param {Array} pictograms - The pictograms that make up this set.
	 */
	constructor(pictograms) {
		super(pictograms)
	}
	
	/**
	 * Get a pair of two randomly picked pictograms from the set.
	 * @returns {KanamemoArray} Array comprised of the randomly picked pictograms.
	 */
	getRandomPair() {
		let pictogramsAvailable = new KanamemoArray(this)
		let pictogramsChosen = new KanamemoArray()
		
		pictogramsAvailable.shuffle()
		for (let i = 0; i < 2; i++)  { // Loop twice.
			pictogramsChosen.push(pictogramsAvailable.pop())
		}
		return pictogramsChosen
	}
}

/**
 * A PictogramSet consisting of a matching romaji, hiragana and katakana.
 */
class KanaSet extends PictogramSet {
	
	/**
	 * Create a KanaSet object.
	 * @param {string} romaji - 
	 * @param {string} hiragana - 
	 * @param {string} katakana - 
	 */
	constructor(romaji, hiragana, katakana) {
		super([romaji, hiragana, katakana])
		this.romaji = romaji
		this.hiragana = hiragana
		this.katakana = katakana
	}
}

/**
 * File handler that can open and read files into strings.
 */
class File {
	
	/**
	 * Create a file handler and, if so specified, load the file.
	 * @param {string} path - Filesystem or HTTP path.
	 * @param {string} mode - Either FILE (not implemented) or HTTP.
	 * @param {boolean} openImmediately - True to run .open right away from the constructor (default).
	 */
	constructor(path, mode, openImmediately=true) {
		this.path = path
		this.mode = mode
		this.request = new XMLHttpRequest()
		if (openImmediately) {
			this.open(this.path)
		}
	}
	
	/**
	 * Open the file.
	 * @param {string} path - Filesystem or HTTP path.
	 * @return File contents.
	 */
	open(path) {
		this.request.open("GET", path, false)
		this.request.send()
		if (!this.requestSuccessful()) {
			throw new FileError(["NOT_FOUND"], "File not found: "+path).embed()
		}
		return this.getContent()
	}
	
	
	
	
	
	requestSuccessful() {
		if (this.mode === "HTTP") {
			if (this.responseCode == 200) {
				return true
			}
		}
		return false
	}
	
	/**
	 * Get the file's content.
	 * @return {string} file content.
	 */
	getContent() {
		return this.request.responseText
	}
	
	/**
	 * Get file path in its final resolved form (after redirects, etc.)
	 * @return {string} URL/file path.
	 */
	getResolvedPath() {
		return this.request.responseURL
	}
	
	/**
	 * Get the response from the file server or filesystem (e.g. HTTP status code)
	 * @return {number} response code.
	 */
	get responseCode() {
		return this.request.status
	}
}


/**
 * File subclass with JSON functionality.
 */
class JsonFile extends File {
	/**
	 * Return JSON parsed from the file.
	 */
	getJson() {
		let deb = this.getContent()
		return JSON.parse(this.getContent())
	}
}

/**
 * Base class for themes.
 * @interface
 */
class Theme {}

/**
 * Theme for Tile objects, to be used with when they're rendered on screen.
 * @implements {Theme}
 */
class TileTheme extends Theme {
	
	/**
	 * Create a TileTheme object.
	 * @param {string} upImg - URL to the background image used for up facing tiles.
	 * @param {string} downImg - URL to the background image used for down facing tiles.
	 * @param {string} matchedImg - URL to the background image used for matched tiles.
	 * @param {string} upCode - HTML template literal to be used for up facing tiles.
	 * @param {string} downCode - HTML template literal to be used for down facing tiles.
	 * @param {string} matchedCode - HTML template literal to be used for matched tiles.
	 */
	constructor(upImg, downImg, matchedImg, upCode, downCode, matchedCode) {
		super()
		this.img = {
			up: upImg,
			down: downImg,
			matched: matchedImg
		}
		this.code = {
			up: upCode,
			down: downCode,
			matched: matchedCode
		}
	}
}

/**
 * Manages a DOM element (and its children) for on-screen rendering.
 * The DOM can be an already existing one, or can be created by one of our methods.
 * @property {string} id - CSS ID of the DOM element in question.
 */
class RenderableHtml {
	
	/**
	 * 
	 */
	constructor(id) {
		this.id = id
	}
	
	/**
	 * Our top level DOM element.
	 */
	get element() {
		return document.getElementById(this.id)
	}
	
	/**
	 * Our top level DOM element's parent element.
	 */
	get parent() {
		return this.element.parentElement
	}
	
	/**
	 * Does our top level DOM element exist (yet)?
	 */
	get elementExists() {
		return !(this.element === null)
	}
	
	/**
	 * Create a document fragment from the specified markup.
	 * @param {string} markup - Markup specifying a DOM hierarchy.
	 * @returns {Array} Contains two values, the fragment and the ID of .firstElementChild, like so: [fragment, id]
	 */
	createDocumentFragmentFromMarkup(markup) {
		let fragment = document.createRange().createContextualFragment(markup)
		let id = fragment.firstElementChild.id
		return [fragment, id]
	}
	
	/**
	 * Take the specified markup and create a document fragment as a child for the specified parent element.
	 * Will replace this.id with the id of the first element child of the resulting document fragment.
	 * @param {Object} parentElement - DOM element serving as our parent element.
	 * @param {string} markup - Markup to convert into DOM to add it to the parent element.
	 */
	createElement(parentElement, markup) {
		let [fragment, id] = this.createDocumentFragmentFromMarkup(markup)
		this.id = id
		parentElement.appendChild(fragment)
	}
	
	/**
	 * Replace the element of this RenderableHtml with a new document fragment created from the specified markup.
	 * @param {string} markup - Markup representing a DOM hierarchy.
	 */
	replaceElementByMarkup(markup) {
		let [fragment, id] = this.createDocumentFragmentFromMarkup(markup)
		this.id = id
		this.parent.replaceChild(fragment, this.element)
	}
	
	/**
	 * Put this element into the DOM. If it doesn't exist yet, create.
	 * @param {Object} parentElement - DOM element serving as our parent element.
	 * @param {string} markup - Markup from which to create our element if it doesn't exist eyt.
	 */
	render(parentElement, markup) {
		if (this.elementExists) {
			this.replaceElementByMarkup(markup)
		} else {
			this.createElement(parentElement, markup)
		}
	}
}

/**
 * A grid tile. Knows its pictogram and state (e.g. face up or down).
 * @augments RenderableHtml - "id" property is inherited, but altered using the TILE_HANDLE template.
 * 
 * Parameters added as properties:
 * @property {string} tileId - ID of the tile (position in the grid)
 * @property {string} pictogram - My pictogram.
 * @property {PictogramSet} pictogramSet - The PictogramSet object my pictogram belongs to.
 * @property {Theme} theme - Theme object that determines my appearance.
 * 
 * Original properties:
 * @property {Object} onClickHandlers - The "click" event handlers I need to function.
 * @property {number} MATCHED - Used to set and compare state as to whether we're in matched state.
 * @property {number} UP - Used to set and compare as to whether we're in UP state.
 * @property {DOWN} DOWN - Used to set and compare as to whether we're in DOWN state.
 * @property {number} state - Which state we're in (MATCHED, UP, or DOWN).
 */
class Tile extends RenderableHtml{
	
	/**
	 * A memo tile to click on, and its various states.
	 * @param {string} tileId - ID of the tile (position in the grid)
	 * @param {string} pictogram - My pictogram.
	 * @param {PictogramSet} pictogramSet - The PictogramSet object my pictogram belongs to.
	 * @param {Theme} Theme object that determines my appearance.
	 */
	constructor(tileId, pictogram, pictogramSet, theme) {
		
		super(TILE_HANDLE(tileId))
		this.tileId = tileId
		this.pictogram = pictogram
		this.pictogramSet = pictogramSet
		this.theme = theme
		this.onClickHandlers = {}
		
		/* State pseudo "constants". */
		this.MATCHED = 0 // Tile's been matched.
		this.UP = 1 // Tile is revealed and showing its pictogram.
		this.DOWN = 2 // Tile is showing its back, hiding its pictogram.
		
		this.state = this.DOWN // We assume we'll want tiles starting face down.
		
	}
	
	/**
	 * The markup for our current state (either matched, up or down).
	 * @returns {string}
	 */
	get markup() {
		switch (this.state) {
			case this.MATCHED:
				return this.matchedMarkup
			case this.UP:
				return this.upMarkup
			case this.DOWN:
				return this.downMarkup
		}
	}
	
	/**
	 * Render and add this tile to the specified parent DOM element, so it's visible on the screen.
	 * @param {Object} parentElement - Parent DOM element to add the tile DOM hierarchy to display it.
	 */
	render(parentElement) {
		RenderableHtml.prototype.render.call(this, parentElement, this.markup)
		this.setOnClickHandler()
	}
	
	/**
	 * Markup for our matched state.
	 * @returns {string}
	 */
	get matchedMarkup() {
		return this.theme.code.matched(this.id, {background: this.theme.img.matched, character: " "})
	}
	
	/**
	 * Markup for our up state.
	 * @returns {string}
	 */
	get upMarkup() {
		return this.theme.code.up(this.id, {background: this.theme.img.up, character: this.pictogram})
	}
	
	/**
	 * Markup for our down state.
	 * @returns {string}
	 */
	get downMarkup() {
		if (DEBUG) {
			return this.theme.code.down(this.id, {background: this.theme.img.down, character: this.pictogram})
		} else {
			return this.theme.code.down(this.id, {background: this.theme.img.down, character: " "})
		}
	}
	
	/**
	 * Add the appropriate onClick event handler to the element depending
	 * on our current state.
	 * This is only to be called after the interface has been rendered.
	 * @param {funtion} onClickMatched - Called when clicked in matched state.
	 * @param {function} onClickUp - Called when clicked in up state.
	 * @param {function} onClickDown - Called when clicked in down state.
	 */
	addOnClickHandlers(onClickMatched, onClickUp, onClickDown) {
		this.onClickHandlers[this.MATCHED] = onClickMatched
		this.onClickHandlers[this.UP] = onClickUp
		this.onClickHandlers[this.DOWN] = onClickDown
	}
	
	/**
	 * Adds all "click" handlers for this tile to the DOM element that represents it.
	 * This method is useful for re-adding the handlers whenever the DOM element is recreated.
	 */
	setOnClickHandler() {
		this.element.addEventListener("click", this.onClickHandlers[this.state])
	}
	
	changeToMatched () {
		this.state = this.MATCHED
		this.render()
	}
	
	changeToUp() {
		this.state = this.UP
		this.render()
	}
	
	changeToDown() {
		this.state = this.DOWN
		this.render()
	}
	
	/**
	 * @param {Tile} tile - Are we in the same pictogram set as this tile?
	 */
	isInSameSetAs(tile) {
		return this.pictogramSet === tile.pictogramSet
	}
	
	/* ==================================
	 State query methods. */
	isMatched()	{ if (this.state == this.MATCHED) 	{ return true } else { return false } }
	isUp()		{ if (this.state == this.UP) 		{ return true } else { return false } }
	isDown()	{ if (this.state == this.DOWN) 		{ return true } else { return false } }
	
}

/**
 * Grid theme.
 * @property {TileTheme} tileTheme - TileTheme object used for tile themeing.
 * @todo Grid theming isn't really implemented yet.
 */
class GridTheme {
	
	/** Create a GridTheme object.
	 * @param {TileTheme} TileTheme object to be used for grid tiles.
	 */
	constructor(tileTheme) {
		this.tileTheme = tileTheme
	}
}

/**
 * The memo tile grid.
 * 
 * Parameters added as properties:
 * @property {number} rowCount - Number of rows.
 * @property {number} columnCount - Number of columns.
 * @property {GridTheme} theme - GridTheme object to determine the grid's appearance.
 * 
 * Original properties: 
 * @property {Array} tiles - Tile objects representing the grid's tiles.
 */
class Grid extends RenderableHtml {
	
	/** Creates a Grid object.
	 * @param {number} rowCount - Number of rows.
	 * @param {number} columnCount - Number of columns.
	 * @param {GridTheme} theme - GridTheme object to determine the grid's appearance.
	 * @todo Add actual visuals (such as a background) to the grid that can be themed.
	 */
	constructor(rowCount, columnCount, theme) {
		super("grid") //NOTE: Candidate for change once grid template is implemented.
		this.rowCount = rowCount
		this.columnCount = columnCount
		this.theme = theme
		this.tiles = new Array(rowCount*columnCount)
	}
	
	/**
	 * Populate the grid with tiles based on pictogram sets specified.
	 * @param {PictogramSets} A PictogramSets object with pictograms to choose from to populate the grid with tiles for.
	 */
	populate(pictogramSets) {
		this.populateRandomPairs(pictogramSets)
	}
	
	/**
	 * Randomly picks two pictograms from pictogram sets randomly picked from the specified PictogramSets object.
	 * Every pictogram gets its own Tile object, which is added to the tiles property.
	 * @example -  From {[a,b,c], [d,e,f]}, it could pick [a,c] and [f,e]. It'd add 4 Tile objects, one for each.
	 * It does this until the grid is full.
	 * @warning PictogramSets needs to have enough pictograms to fill the grid.
	 * @todo Handle PictogramSets not having enough pictograms to fill the grid.
	 */
	populateRandomPairs(pictogramSets) {
		let tileIndexesAvailable = new KanamemoArray(this.tiles.length).initWithIndices().shuffle()
		for (let pictogramSet of pictogramSets.shuffle()) {
			if (!tileIndexesAvailable.length > 0) {break}
			let pictogramAIndex = tileIndexesAvailable.pop()
			let pictogramBIndex = tileIndexesAvailable.pop()
			let pair = pictogramSet.getRandomPair() // Example: Get random two from [romaji, hiragana, katakana].
			this.tiles[pictogramAIndex] = new Tile(pictogramAIndex, pair[0], pictogramSet, this.theme.tileTheme)
			this.tiles[pictogramBIndex] = new Tile(pictogramBIndex, pair[1], pictogramSet,this.theme.tileTheme)
		}
	}
	
	/**
	 * The grid's Tile objects sorted into rows.
	 * @todo Not implemented.
	 */
	get rows() {}
	
	/**
	 * Get the rendered markup/code for the grid.
	 * @todo Not implemented.
	 */
	get markup() {}
	
	/**
	 * Render the grid into the specified DOM element.
	 * @param {Object} element - DOM element to render into.
	 */
	render(element) {
		let rowElementsAdded = 0
		for (let tile of this.tiles) {
			tile.render(element) //NOTE: Will become this.element once grid has its own HTML.
			rowElementsAdded += 1
			if (rowElementsAdded === this.columnCount) {
				element.appendChild(document.createRange().createContextualFragment("<br/>"))
				rowElementsAdded = 0
			}
		}
	}
}

/**
 * A KanamemoArray with the capability to initialize itself with KanaSet objects initialized with data from a file.
 */
class PictogramSets extends KanamemoArray {
	
	/**
	 * @param {string} sourceFilePath - File path to read set data from.
	 */
	constructor(sourceFilePath) {
		super()
		this.getFromFile(sourceFilePath).sets.forEach(set => {
			this.push(new KanaSet(...set))
		})
	}
	
	/**
	 * Read JSON from the specified file path.
	 * @param {string} sourceFilePath - File path to read set data from.
	 * @returns JSON in object form as it was read from the file.
	 */
	getFromFile(sourceFilePath) {
		//console.log(new JsonFile(sourceFilePath, "HTTP").getJson())
		return new JsonFile(sourceFilePath, "HTTP").getJson()
	}
}

/**
 * A collection of all themeing items required to theme the game.
 * Is currently only concerned with GridTheme, which, in turn, is currently only concerned with TileTheme based tile themeing.
 * @property {GridTheme} gridTheme
 */
class GameTheme {
	
	/** Create GameTheme object.
	 * @param {GridTheme} gridTheme - Theme object for the grid.
	 */
	constructor(gridTheme) {
		this.gridTheme = gridTheme
	}
}

/**
 * Manages the DOM element we're rendering into. Is the beginning of the rendering hierarchy.
 * @property {Object} element - DOM element we'll be rendering into.
 */

class HtmlCanvas {
	
	/** Create an HtmlCanvas object.
	 * @param element 
	 */
	constructor(element) {
		this.element = element
	}
	
	/**
	 * Put what's already rendered on display.
	 */
	render(markup) {
		this.element.innerHTML = markup
	}
}

/**
 * Represents the game and manages its parts and execution.
 * @property {Canvas} - Object managing the interface we're working with (e.g. DOM hierarchy).
 * @property {string} collection - Path to the collection JSON file specifying our pictograms.
 * @property {GameTheme} theme - GameTheme object with all the media configured we need to render the game.
 * @property sets {PictogramSets} - Pictogram sets as taken from the specified JSON file sorted into an Array-like object.
 */
class Game {
	
	/**
	 * Create a Game object.
	 * @param {Canvas} canvas - Object managing the interface we're working with (e.g. DOM hierarchy).
	 * @param {string} collection - Path to the collection JSON file specifying our pictograms.
	 * @param {GameTheme} theme - GameTheme object with all the media configured we need to render the game.
	 */
	constructor(canvas, collection, theme) {
		this.canvas = canvas
		this.collection = collection
		this.theme = theme
		this.sets = new PictogramSets(this.collection)
	}
	
	/**
	 * Get the game displayed/updated on the screen according to its current state.
	 * @abstract
	 */
	render() {}
	
	/**
	 * Initialize the game (add DOM elements and events, for example).
	 * @abstract
	 */
	setUp() {}
	
	/**
	 * Initialize and start the game.
	 */
	run() {
		this.setUp()
	}
}

/**
 * Object passed directly to javascript event functions, which then execute its handleEvent method.
 * @properties {Game} game - Game object representing the game, so it's available during event handling.
 */
class KanaGameEvent {
	
	/** Create KanaGameEvent
	 * @param {KanaGame} game - Game object representing the game.
	 */
	constructor(game) {
		this.game = game
	}
	/**
	 * Events such as "onclick" will execute this. Subclass & override.
	 */
	handleEvent(event) {}
}

/**
 * Event handler for tiles.
 * @augments KanaGameEvent - We inherit all properties unchanged.
 * @properties {Tile} tile - Tile object representing the tile this event pertains to.
 */
class KanaGameTileEvent extends KanaGameEvent {
	
	/**
	 * Create a KanaGameTileEvent object.
	 * @param {KanaGame} game - Game object representing the game.
	 * @param {Tile} tile - Tile object representing the tile this event pertains to.
	 */
	constructor(game, tile) {
		super(game)
		this.tile = tile
	}
}

/**
 * Event handler for what happens when a tile in the matched state is clicked.
 * @augments KanaGameOnMatchedTileClickEvent - Constructor remains unchanged.
 */
class KanaGameOnMatchedTileClickEvent extends KanaGameTileEvent {
	
	/**
	 * @todo Not implemented.
	 */
	handleEvent(event) {
		console.log("Matched tile event fired: "+event)
	}
}

/**
 * Event handler for what happens when a tile in the up state is clicked.
 * @augments KanaGameOnUpTileClickEvent - Constructor remains unchanged.
 */
class KanaGameOnUpTileClickEvent extends KanaGameTileEvent {
	
	/**
	 * @todo Not implemented.
	 */
	handleEvent(event) {
		console.log("Up tile event fired: "+event)
	}
}

/**
 * Event handler for what happens when a tile in the down state is clicked.
 * @augments KanaGameTileEvent - Constructor remains unchanged.
 */
class KanaGameOnDownTileClickEvent extends KanaGameTileEvent {
	
	/**
	 * Change tile to the up state, and process all tiles in the up state subsequently.
	 * This is where functionality such as checking whether the up facing tiles on the
	 * board are matching and the actions depending on that are hooked in.
	 */
	handleEvent(event) {
		// Flip our tile up.
		this.tile.changeToUp()
		this.game.upTiles.push(this.tile)
		this.game.processUpTiles()
	}
}

/**
 * Represents the game and handles things such as running it, its state or appearance.
 * Also contains or refers (e.g. by the means of event handlers) the game's logic.
 * @augments Game - Constructor parameters and properties inherited without change.
 * @property {Array} upTiles - All tiles currently in the up state.
 * @property {number} numberOfTilesNeededForMatch - Number of tiles needed for a match.
 */
class KanaGame extends Game {
	
	constructor(canvas, collection, theme) {
		super(canvas, collection, theme)
		
		this.upTiles = []
		
		// Options.
		this.numberOfTilesNeededForMatch = 2
	}
	
	/**
	 * Initialize the game: Create the grid, put tiles in it, add event handlers and render.
	 */
	setUp() {
		// Create grid.
		this.grid = new Grid(4, 4, this.theme.gridTheme)
		this.grid.populate(this.sets)
		this.addOnClickHandlersToTiles()
		this.render()
	}
	
	/**
	 * Render the game/update the relevant parts on the screen.
	 */
	render() {
		this.grid.render(this.canvas.element)
	}
	
	/**
	 * Do we have more tiles than what's needed for a match?
	 * This should never exceed the number of tiles needed for a match by more
	 * than one.
	 */
	get maxUpTilesNeededForMatchExceeded() {
		return (this.upTiles.length > this.numberOfTilesNeededForMatch)
	}
	
	/**
	 * Do we have all the tiles we need to be checking for a match?
	 */
	get maxUpTilesNeededForMatchReached() {
		return (this.upTiles.length === this.numberOfTilesNeededForMatch)
	}
	
	/**
	 * Do the tiles currently in the up state form a match?
	 */
	upTilesAreMatching() {
		console.log("Matching:")
		console.log(this.upTiles[0])
		console.log(this.upTiles[1])
		return this.upTiles.every(upTile => upTile.isInSameSetAs(this.upTiles[0]))
	}
	
	/**
	 * Everything that needs to be done once a match is confirmed.
	 * Currently, all it does is change the status of all up tiles to matched.
	 */
	processMatch() {
		while(this.upTiles.length > 0) { this.upTiles.pop().changeToMatched() }
	}
	
	/**
	 * Everything that needs to be done once it's clear the tiles aren't matching.
	 * Currently, all it does is change the status of all up tiles except the most
	 * recently up-flipped one to down.
	 */
	processMismatch() {
		for (let remaining = this.upTiles.length - 1; remaining > 0; remaining--) {
			this.upTiles.shift().changeToDown()
		}
	}
	
	/**
	 * Goes through all tiles in the up state, checks what needs to be done and does it.
	 * That means that if it finds the number of tiles needed to compare for a match,
	 * it will do so, and if they match, change them to the matched state.
	 * If they don't match, it'll leave them up, so the player can view them. The next
	 * time a tile is flipped, it'll flip those tiles back to the down state.
	 */
	processUpTiles() {
		// Is the maximum number of up tiles needed for a match reached yet?
		if (this.maxUpTilesNeededForMatchReached) {
			if (this.upTilesAreMatching()) {
				this.processMatch()
			}
		}
		if (this.maxUpTilesNeededForMatchExceeded) {
			this.processMismatch() // Old tiles still lying around, so they were mismatched.
		}
	}
	
	/**
	 * Add click events for each tile state (matched, up and down) to every tile.
	 */
	addOnClickHandlersToTiles() {
		for (let tile of this.grid.tiles) {
			tile.addOnClickHandlers(
				new KanaGameOnMatchedTileClickEvent(this, tile),
				new KanaGameOnUpTileClickEvent(this, tile),
				new KanaGameOnDownTileClickEvent(this, tile))
		}
	}
}

/* Create an instance of KanaGame, configure the theme and run the game.*/
game = new KanaGame(
	// HTML element the game is supposed to be rendered into.
	new HtmlCanvas(document.getElementById("game")),
	// Path to the pictogram collection we want to use.
	"/pictogramcollections/romajihiraganakatakana.json",
	// Theme config.
	new GameTheme(
		new GridTheme(
			// TileTheme: upImg, downImg, matchedImg, code
			//NOTE: For development purposes and because of a lack of img, tilebg fills for matchedImg for now.
			new TileTheme(
				"/img/tilefg.png",
				"/img/tilebg.png",
				"/img/tilebg.png",
				HTML_UP_TILE_MARKUP,
				HTML_DOWN_TILE_MARKUP,
				HTML_MATCHED_TILE_MARKUP
			)
		)
	)
)
game.run()
