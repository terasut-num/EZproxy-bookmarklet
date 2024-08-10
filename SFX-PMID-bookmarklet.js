// Prompt the user for DOI input and validate the DOI format
function getUserInput() {
    let userInput = prompt('Please enter the DOI number, e.g. 10.xxx/xxx:');
    if (userInput && userInput.startsWith('10.')) {
        return userInput;
    } else {
        alert("Please enter a valid DOI number!");
        return null;
    }
}

// Extract the correct DOI from a list of DOIs
function findDoi(allDoi) {
    if (!allDoi) {
        allDoi = [getUserInput()];
    }

    if (!allDoi || allDoi.length === 0) {
        alert("No DOI found, please specify the DOI number.");
        return findDoi(null);
    }

    const uniqueDoiCount = allDoi.reduce((acc, doi) => {
        const matchedDoi = doi.match(/10\.\d{4,9}\/[-._;()\/:A-Z0-9]+/i);
        if (matchedDoi) {
            acc[matchedDoi[0]] = (acc[matchedDoi[0]] || 0) + 1;
        }
        return acc;
    }, {});

    let finalDoi = null;
    let maxCount = 0;
    for (const doi in uniqueDoiCount) {
        if (uniqueDoiCount[doi] > maxCount) {
            maxCount = uniqueDoiCount[doi];
            finalDoi = doi;
        } else if (uniqueDoiCount[doi] === maxCount) {
            finalDoi = null;
        }
    }

    if (!finalDoi) {
        alert("Multiple DOIs found! Please specify the correct DOI number.");
        return findDoi(null);
    }

    return finalDoi;
}

// Convert DOI to PMID using NCBI API
async function convertDoiToPmid(doi) {
    const encodedDoi = encodeURIComponent(doi);
    const searchUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term="+encodedDoi+"&format=json";

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error('Network response was not OK: ' + response.statusText);
        }

        const data = await response.json();
        const idList = data?.esearchresult?.idlist || [];
        if (idList.length === 1) {
            return idList[0];
        } else {
            alert("Cannot find a PMID for this article!");
            return null;
        }
    } catch (error) {
        console.error('Error fetching PMID:', error);
        return null;
    }
}

// Main Process
async function main() {
    const baseSfx = .............................; // Replace with your SFX Base URL
	const pmidSfx = '?sid=Entrez:PubMed&id=pmid:';
    let allDoi = document.documentElement.innerHTML.match(/10\.\d{4,9}\/[-._;()\/:A-Z0-9]+/ig);

    if (window.location.hostname === 'journals.sagepub.com') {
        const doiMetaTag = document.getElementsByTagName('meta')[property = 'dc.Identifier'];
        if (doiMetaTag) {
            const doiContent = doiMetaTag.content.replace('_', '/');
            allDoi = [doiContent];
        } else {
            alert("Cannot find any DOI in this SAGE journal. Please specify the DOI number!");
            allDoi = null;
        }
    }

    const doiFinal = findDoi(allDoi);
    if (doiFinal) {
        const pmid = await convertDoiToPmid(doiFinal);
        if (pmid) {
            window.open(baseSfx + pmidSfx + pmid);
        }
    }
}

// Execute the main process
main();
