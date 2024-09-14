const getStoreListWrapper = () => {
    return document.querySelector('.container #userList');
};
const getProducts = () => {
    const savedProducts = localStorage.getItem('corehiProductCombinationFinder');
    return savedProducts ? JSON.parse(savedProducts) : [];
};

const addProduct = ({ target }) => {
    target.innerText = 'Eklendi';
    const products = getProducts();
    const productID = document.querySelector('#baseId').value;
    const productTitle = window.location.pathname.includes('UserProductDetail') ? document.title : document.querySelector('.product-item__title').innerText;
    if (window.location.pathname.includes('UserProductDetail')) {
        const url = document.querySelector('#content > div.container.product-detail > div.mb-2 > div > div.col-md-12.col-lg-3.col-xl-3 > div > div > div.font-size-14.pb-2.border-color-1.border-bottom.mb-3 a').href;
        const rawPrice = document.querySelector(
            '#content > div.container.product-detail > div.mb-2 > div > div.col-md-6.col-lg-5.col-xl-4.mb-md-6.mb-lg-0.closest-container > div.d-block > div.d-lg-flex.align-items-lg-baseline.position-relative.at-cart-container > ins'
        ).innerText;
        products.push({
            productID,
            productTitle,
            storeURL: url,
            storeID: new URL(url).searchParams.get('userId'),
            productURL: window.location.href,
            price: parseFloat(rawPrice.replace('\n', '').replace(' TL', '').replace(',', '.')),
        });
    }

    getStoreListWrapper()
        .querySelectorAll('.all-price-item')
        .forEach((wrapper) => {
            const url = wrapper.querySelector('.all-price-item-content a').href;
            const id = window.location.pathname.includes('UserProductDetail') ? url.match(/.*UserProductDetail\?id=(\d+)/)[1] : url.match(/.*UserProfile\?userId=(\d+)/)[1];
            const price = parseFloat(wrapper.querySelector('.all-price-item-content.price').innerText.replace('\n', '').replace(' TL', '').replace(',', '.'));
            console.log('selam');
            const dataPid = wrapper.querySelector('input[data-pid]').attributes['data-pid'].value;
            const productURL = `https://www.ecza1.com/Shop/UserProductDetail?id=${dataPid}`;
            products.push({
                productID,
                productTitle,
                storeID: id,
                storeURL: url,
                productURL,
                price,
            });
        });
    localStorage.setItem('corehiProductCombinationFinder', JSON.stringify(products));
};

const finishCombination = ({ target }) => {
    target.innerText = 'tamamlandı';
    localStorage.removeItem('corehiProductCombinationFinder');
};

const writeCombinationOutput = (combinationResults) => {
    console.log(combinationResults);
    const products = getProducts();
    const container = getStoreListWrapper().parentElement;
    const resultDiv = document.createElement('div');
    combinationResults.forEach((r) => {
        const resultItemContainer = document.createElement('pre');
        const matchedProductsMap = r.matchedProducts.map((p) => {
            const minimumPrice = products
                .filter((_p) => _p.productID === p.productID)
                .sort((p1, p2) => {
                    if (p1.price < p2.price) {
                        return -1;
                    } else if (p1.price > p2.price) {
                        return 1;
                    }
                    return 0;
                })[0].price;
            return {
                text: `ürün adı: ${p.productTitle}\nbulunan fiyat: ${p.price}\nen düşük fiyat: ${minimumPrice}\n<a class="btn btn-dark-primary transition-3d-hover" style="width:100px;height: 20px;display: block;line-height: normal;padding: 0;" href="${p.productURL}">Link</a>`,
                foundedPrice: p.price,
            };
        });

        resultItemContainer.innerHTML = `${matchedProductsMap.map((p) => p.text).join('<br><br>')}<br><br>Toplam: ${matchedProductsMap
            .map((p) => p.foundedPrice)
            .reduce((previous, current) => {
                previous += current;
                return previous;
            }, 0)} TL`;

        const hr = document.createElement('hr');
        resultDiv.append(resultItemContainer, hr);
    });
    container.prepend(resultDiv);

    console.log('aa', combinationResults);
};

const findCombination = () => {
    const products = getProducts();
    const results = [];
    products.forEach((p) => {
        const match = products.filter((_p) => p.productID !== _p.productID && p.storeID === _p.storeID && !results.map((r) => r.storeID).includes(_p.storeID));
        if (match.length > 0) {
            results.push({
                matchedProducts: [p, ...match],
                totalPrice: match.reduce((acc, current) => {
                    return acc + current.price;
                }, p.price),
                storeID: p.storeID,
                storeURL: p.storeURL,
                productURL: p.productURL,
            });
        }
    });
    writeCombinationOutput(results);
};

const init = () => {
    const container = getStoreListWrapper().parentElement;
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style = 'display: flex; gap: 10px; margin-top: 20px; margin-bottom: 20px;';
    const addButton = document.createElement('button');
    addButton.innerText = '✅ Kombinasyon Bulucuya Ekle';
    addButton.className = 'btn btn-dark-primary transition-3d-hover';
    addButton.onclick = addProduct;
    buttonWrapper.append(addButton);

    const findCombinationButton = document.createElement('button');
    findCombinationButton.innerText = '🔍 Kombinasyonu Bul';
    findCombinationButton.className = 'btn btn-dark-primary transition-3d-hover';
    findCombinationButton.onclick = findCombination;
    buttonWrapper.append(findCombinationButton);

    const finishButton = document.createElement('button');
    finishButton.innerText = '❌ Kombinasyonu Sıfırla';
    finishButton.onclick = finishCombination;
    finishButton.className = 'btn btn-dark-primary transition-3d-hover';
    buttonWrapper.append(finishButton);
    container.prepend(buttonWrapper);
};

document.addEventListener('load', init);
