const mapContainer = document.getElementById('mapContainer');
const computerSelect = document.getElementById('computerSelect');
const packageModal = document.getElementById('packageModal');
const servicePackageSelect = document.getElementById('servicePackage');
const productOptions = document.getElementById('productOptions');
const totalPriceElement = document.getElementById('totalPrice');
let selectedComputer = null;
let draggedElement = null;
let computerCount = 0;
let scale = 1;
const maxScale = 2; // Максимальный уровень масштаба
const minScale = 0.5; // Минимальный уровень масштаба

// Заглушки: пакеты услуг и товары
const servicePackages = [
    { id: 1, name: 'Рабочий час', price: 100 },
    { id: 2, name: '3 рабочих часа', price: 250 },
    { id: 3, name: 'Пакет-работяга (целый день)', price: 500 }
];

const products = [
    { id: 1, name: 'Кофе', price: 50 },
    { id: 2, name: 'Чай', price: 30 },
    { id: 3, name: 'Выпечка', price: 50 }
];

// Изначальная установка компьютеров
function setupInitialComputers() {
    const initialPositions = [
        { left: '10%', top: '10%' },
        { left: '30%', top: '10%' },
        { left: '50%', top: '10%' },
        { left: '70%', top: '10%' },
        { left: '10%', top: '30%' },
        { left: '30%', top: '30%' },
        { left: '50%', top: '30%' },
        { left: '70%', top: '30%' },
    ];

    initialPositions.forEach(pos => {
        addComputer(pos.left, pos.top);
    });
}

// Функция загрузки карты
function loadMap(event) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            mapContainer.style.width = `${img.width}px`;
            mapContainer.style.height = `${img.height}px`;
            mapContainer.style.backgroundImage = `url(${e.target.result})`;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(event.target.files[0]);
}

// Очистка карты (удаление фона)
function clearMap() {
    mapContainer.style.backgroundImage = '';
}

// Масштабирование карты с лимитами
function zoomIn() {
    if (scale < maxScale) {
        scale += 0.1;
        mapContainer.style.transform = `scale(${scale})`;
    }
}

function zoomOut() {
    if (scale > minScale) {
        scale -= 0.1;
        mapContainer.style.transform = `scale(${scale})`;
    }
}

// Добавление компьютера
function addComputer(left = '10%', top = '50px') {
    computerCount++;

    const computerContainer = document.createElement('div');
    computerContainer.classList.add('computer-container');
    computerContainer.setAttribute('draggable', true); 
    computerContainer.style.left = left;
    computerContainer.style.top = top;
    computerContainer.setAttribute('data-id', computerCount);

    const computer = document.createElement('div');
    computer.classList.add('computer', 'available');
    computer.setAttribute('data-index', computerCount);
    computer.addEventListener('click', () => openModal(computerCount, computer));

    const computerLabel = document.createElement('p');
    computerLabel.textContent = 'Компьютер ' + computerCount;

    computerContainer.appendChild(computer);
    computerContainer.appendChild(computerLabel);
    mapContainer.appendChild(computerContainer);

    // Добавляем компьютер в список для выбора при удалении
    const option = document.createElement('option');
    option.value = computerCount;
    option.textContent = 'Компьютер ' + computerCount;
    computerSelect.appendChild(option);

    // Логика перетаскивания
    computerContainer.addEventListener('dragstart', (e) => {
        draggedElement = e.target;
        e.target.style.opacity = '0.5';
    });

    computerContainer.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
        draggedElement = null;
    });
}

// Удаление выбранного компьютера
function removeSelectedComputer() {
    const selectedValue = computerSelect.value;
    if (selectedValue) {
        const computerToRemove = document.querySelector(`[data-id='${selectedValue}']`);
        mapContainer.removeChild(computerToRemove);

        // Удаляем компьютер из списка выбора
        const optionToRemove = computerSelect.querySelector(`option[value='${selectedValue}']`);
        computerSelect.removeChild(optionToRemove);
    }
}

// Очистка всего поля
function clearAll() {
    mapContainer.innerHTML = '';
    computerSelect.innerHTML = '<option value="" disabled selected>Выберите компьютер для удаления</option>';
    computerCount = 0; // Обнуляем счетчик компьютеров
}

// Открытие модального окна выбора пакета услуг
function openModal(index, computer) {
    selectedComputer = computer;
    if (computer.classList.contains('available')) {
        // Показать модальное окно с выбором пакета услуг и товаров
        openPackageModal();
    } else {
        alert('Этот компьютер уже занят!');
    }
}

// Открытие модального окна для выбора пакета услуг и товаров
function openPackageModal() {
    // Очистим предыдущие опции
    servicePackageSelect.innerHTML = '';
    productOptions.innerHTML = '';

    // Добавляем пакеты услуг в select
    servicePackages.forEach(pkg => {
        const option = document.createElement('option');
        option.value = pkg.id;
        option.textContent = `${pkg.name} - ${pkg.price}₽`;
        servicePackageSelect.appendChild(option);
    });

    // Добавляем товары с чекбоксами
    products.forEach(product => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = product.id;
        checkbox.setAttribute('data-price', product.price); // Добавляем цену к каждому товару
        checkbox.addEventListener('change', updateTotalPrice); // Событие при изменении
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(`${product.name} - ${product.price}₽`));
        productOptions.appendChild(label);
    });

    // Сбрасываем итоговую цену
    updateTotalPrice();

    packageModal.style.display = 'flex'; // Показать модальное окно
}

// Закрытие модального окна
function closePackageModal() {
    packageModal.style.display = 'none';
}

// Логика для кнопки "Подтвердить"
document.getElementById('confirmPackage').addEventListener('click', function() {
    const selectedPackageId = servicePackageSelect.value;
    const selectedProducts = Array.from(productOptions.querySelectorAll('input:checked')).map(checkbox => checkbox.value);

    if (!selectedPackageId) {
        alert('Пожалуйста, выберите пакет услуг!');
        return;
    }

    // Обработка выбранных данных (например, отметка компьютера как занятого)
    selectedComputer.classList.remove('available');
    selectedComputer.classList.add('occupied');

    closePackageModal(); // Закрыть модальное окно
});

// Разрешаем сбрасывать элемент на карту
mapContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
});

// Перемещение компьютера по карте с учетом масштаба и позиции курсора
mapContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    if (draggedElement) {
        const rect = mapContainer.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale - draggedElement.offsetWidth / 2;
        const y = (e.clientY - rect.top) / scale - draggedElement.offsetHeight / 2;

        draggedElement.style.left = `${x}px`;
        draggedElement.style.top = `${y}px`;
    }
});

// Обновление итоговой цены
function updateTotalPrice() {
    const selectedPackageId = servicePackageSelect.value;
    const selectedPackage = servicePackages.find(pkg => pkg.id == selectedPackageId);
    let totalPrice = selectedPackage ? selectedPackage.price : 0;

    const selectedProducts = Array.from(productOptions.querySelectorAll('input:checked'));
    selectedProducts.forEach(product => {
        totalPrice += parseInt(product.getAttribute('data-price'));
    });

    totalPriceElement.textContent = totalPrice; // Обновляем отображение итоговой цены
}

// Инициализация с 8 компьютерами
window.onload = function() {
    setupInitialComputers();
};

function toggleTheme() {
    const body = document.body;
    const modalContent = document.getElementById('modalContent');

    body.classList.toggle('dark-theme');
    modalContent.classList.toggle('dark-theme');

    // Обновить кнопки в модальном окне
    const modalButtons = modalContent.querySelectorAll('button');
    modalButtons.forEach(button => {
        button.classList.toggle('dark-theme');
    });
    
    // Обновить итоговую цену
    const totalPriceElement = document.getElementById('totalPrice');
    totalPriceElement.classList.toggle('dark-theme');
}
