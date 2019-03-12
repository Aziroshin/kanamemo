// ======================================
// Test reslut constants.
const OK = true
const FAIL = false

// Test constants.
const FILE_TEST_VERIFICATION_CONTENT = `{
"name": "Test Collection",
"description": "This is a test file for collection type file tests.",
"sets":
	[
	["A","B","C"],
	["D","E","F"],
	["G","H","I"],
	["J","K","L"]
	]
}
`
// Setup constants.
const FILE_TEST_TESTCOLLECTION_FILEPATH = "/tests/testcollection.json"
const DOMAIN = "kanamemo.localhost"

// ======================================
// Test functionality.

class Test {
	constructor(name){this.name = name}
	setUp(){}
	tearDown(){}
	run(){
		this.setUp()
		let isOk = this.test()
		if (isOk) {
			this.reportOk()
		}
		else {
			this.reportFail()
		}
		this.tearDown()
		return isOk
	}
	test(){return False}
	reportOk(){
		document.write('<div class="testLine">OK: '+this.name+"</div>")
		
	}
	reportFail(){
		document.write('<div class="testLine">FAIL: '+this.name+"</div>")
		
	}
}

class TestSet {
	constructor(name){
		this.name = name
		this.tests = new Array()
		
	}
	addTest(test){
		this.tests.push(test)
	}
	run(){
		document.write('<div class="testSetHeader">Running test set: '+this.name+'</div>')
		document.write('<div class="testSetBody">')
		for (let i = 0; i < this.tests.length; i++){
			this.tests[i].run()
		}
		document.write('</div>')
	}
}

// ======================================
// Tests.

class KanaTest extends Test {
	test() {
		let result = OK
		let kana = new KanaSet("a", "あ", "ア")
		if (kana.romaji != "a") {result = FAIL}
		if (kana.hiragana != "あ") {result = FAIL}
		if (kana.katakana != "ア") {result = FAIL}
		return result
	}
}

class PopulateRandomPairsTest extends Test {
	setUp() {
		this.pictogramSets = new Array(4)
		this.pictogramSets.push(new KanaSet("a", "あ", "ア"))
		this.pictogramSets.push(new KanaSet("i", "い", "イ"))
		this.pictogramSets.push(new KanaSet("u", "う", "ウ"))
		this.pictogramSets.push(new KanaSet("e", "え", "エ"))
		
	}
	hasPictogram(pictogramToCheck) {
		let has = false
		this.pictogramSets.forEach((pictogramSet) => {
			if (pictogramSet.includes(pictogramToCheck)) { has = true}
		})
		return has
	}
	test() {
		let grid = new Grid(2, 4)
		let result = OK
		
		grid.populateRandomPairs(this.pictogramSets)
		grid.tiles.forEach((tile) => {
			if (!this.hasPictogram(tile.pictogram)) {
				result = FAIL
			}
		})
		return result
	}
}

class KanamemoArraySwapTest extends Test {
	test() {
		let result = OK
		let kanamemoArray = new KanamemoArray(["a", "b"])
		kanamemoArray.swap(0, 1)
		if (!(kanamemoArray[0] == "b")) {result = FAIL}
		if (!(kanamemoArray[1] == "a")) {result = FAIL}
		return result
	}
}

class KanamemoArrayShuffleTest extends Test {
	test () {
		// Preparations.
		let result = OK
		let array = new KanamemoArray(["a", "b", "c", "d"])
		// Test generic array initialization.
		if (!(array.length == 4)) {result = FAIL}
		if (!(array.some(element => {return element == "a"}))) {result = FAIL}
		if (!(array.some(element => {return element == "b"}))) {result = FAIL}
		if (!(array.some(element => {return element == "c"}))) {result = FAIL}
		if (!(array.some(element => {return element == "d"}))) {result = FAIL}
		
		// Shuffle & check array multiple times to minimize chance for test to fail randomly.
		// The idea is that every index of the array should at least have contained either
		// a, b, c or d at least once.
		// For efficiency, we're running the test loop with index "i" inside another loop with
		// index "r", whereas the "r" loop checks whether the randomization test inside the "i"
		// loop has passed (all "found" array values are set to true). If not, it continues
		// kicking off the "i" loop up to a set number of times, until it acknowledges
		// actual failure and exits.
		let found = new Array(4)
		let randomizationTestResult;
		// The two-dimensional "found" array to record test results.
		found[0] = [false, false, false, false]
		found[1] = [false, false, false, false]
		found[2] = [false, false, false, false]
		found[3] = [false, false, false, false]
		for (let r = 0; r < 10; ++r) {
			for (let i = 0; i < 10; ++i) {
				let shuffledArray = array.shuffle()
				// If shuffledArray[j] contains a character k (looped from ["a", "b", "c", "d"]),
				// flag k in found[j] as "true". Do this enough times, and found should eventually
				// fill up with "true" if the code we're testing is working as intended.
				for (let j = 0; j < 4; ++j) {
					for (let k = 0; k < 4; ++k) {
						if (shuffledArray[j] == ["a", "b", "c", "d"][k]) {
							found[j][k] = true
							break
						}
					}
				}
			}
			// OK or FAIL?
			randomizationTestResult = OK
			for (let i = 0; i < 4; ++i) {
				for (let j = 0; j < 4; ++j) {
					if (found[i][j] == false) {
						randomizationTestResult = FAIL
					}
				}
			}
			if (randomizationTestResult) {
				break
			}
		}
		result = randomizationTestResult
		return result
	}
}

class FileHttpTest extends Test {
	setUp() {
		this.file = new File(FILE_TEST_TESTCOLLECTION_FILEPATH, "HTTP")
	}
}

class FileHttpJsonTest extends Test {
	setUp() {
		this.file = new JsonFile(FILE_TEST_TESTCOLLECTION_FILEPATH, "HTTP")
	}
}

class FileHttpGetResolvedPathTest extends FileHttpTest {
	test() {
		if (this.file.getResolvedPath() === "http://"+DOMAIN+FILE_TEST_TESTCOLLECTION_FILEPATH) {
			return OK
		} else {
			return FAIL
		}
	}
}

class FileGetResponseCodeHttpTest extends FileHttpTest {
	test() {
		if (this.file.responseCode === 200) {
			return OK
		} else {
			return FAIL
		}
	}
}

class FileHttpGetContentTest extends FileHttpTest {
	test() {
		if (this.file.getContent() === FILE_TEST_VERIFICATION_CONTENT) {
			return OK
		} else {
			return FAIL
		}
	}
}

class FileHttpGetJsonTest extends FileHttpJsonTest {
	test() {
		let result = OK
		let json = this.file.getJson()
		
		// Test json.name and json.description
		if (!(json.name === "Test Collection"
			&& json.description === "This is a test file for collection type file tests.")) { 
			return FAIL
		}
		
		// Test arrays.
		let testArray = [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "I"], ["J", "K", "L"]]
		let setIndex = 0
		let arrayResults = [[], [], []]
		for (let set of json.sets) {
			let elementIndex = 0
			for (let setElement of set) {
				if (setElement != testArray[setIndex][elementIndex]) {
					return FAIL
				}
				elementIndex += 1
			}
			setIndex += 1
		}
		
		return OK
	}
}

// ======================================
// Running the tests.

document.write('<div class="header">Tests:</div>')
let tests = new TestSet("All")
tests.addTest(new KanaTest("KanaTest"))
tests.addTest(new PopulateRandomPairsTest("PopulateRandomPairsTest"))
tests.addTest(new KanamemoArraySwapTest("KanamemoArraySwapTest"))
tests.addTest(new KanamemoArrayShuffleTest("KanamemoArrayShuffleTest"))
tests.addTest(new FileHttpGetResolvedPathTest("FileHttpGetResolvedPathTest"))
tests.addTest(new FileGetResponseCodeHttpTest("FileGetResponseCodeHttpTest"))
tests.addTest(new FileHttpGetContentTest("FileHttpGetContentTest"))
tests.addTest(new FileHttpGetJsonTest("FileHttpGetJsonTest"))
tests.run()
