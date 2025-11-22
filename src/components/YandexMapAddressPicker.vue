<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Введите адрес или выберите на карте",
  },
});

const emit = defineEmits(["update:modelValue"]);

const mapContainer = ref(null);
const addressInput = ref(null);
const suggestionsContainer = ref(null);
const map = ref(null);
const placemark = ref(null);
const suggest = ref(null);
const suggestions = ref([]);
const showSuggestions = ref(false);
const selectedAddress = ref(props.modelValue || "");
const isMapReady = ref(false);
const isSearching = ref(false);
const searchError = ref("");

let ymaps = null;

// Инициализация карты
const initMap = () => {
  if (typeof window.ymaps === "undefined") {
    console.error("Яндекс.Карты не загружены");
    return;
  }

  ymaps = window.ymaps;

  ymaps.ready(() => {
    // Создаем карту
    map.value = new ymaps.Map(mapContainer.value, {
      center: [55.751574, 37.573856], // Москва по умолчанию
      zoom: 10,
      controls: ["zoomControl", "fullscreenControl"],
    });

    // Создаем метку
    placemark.value = new ymaps.Placemark(
      map.value.getCenter(),
      {},
      {
        draggable: true,
        preset: "islands#blueDotIcon",
      }
    );

    map.value.geoObjects.add(placemark.value);
    isMapReady.value = true;
    searchError.value = "";

    // Обработчик клика на карту
    map.value.events.add("click", (e) => {
      const coords = e.get("coords");
      placemark.value.geometry.setCoordinates(coords);
      geocodeCoordinates(coords);
    });

    // Обработчик перетаскивания метки
    placemark.value.events.add("dragend", () => {
      const coords = placemark.value.geometry.getCoordinates();
      geocodeCoordinates(coords);
    });

    // Инициализация Suggest
    if (addressInput.value) {
      suggest.value = new ymaps.SuggestView(addressInput.value, {
        container: suggestionsContainer.value,
        offset: [0, 5],
        width: "100%",
      });

      suggest.value.events.add("select", (e) => {
        const selectedItem = e.get("item");
        const address = selectedItem.value;
        selectedAddress.value = address;
        emit("update:modelValue", address);
        geocodeAddress(address);
        showSuggestions.value = false;
      });
    }

    // Если есть начальный адрес, геокодируем его
    if (selectedAddress.value) {
      geocodeAddress(selectedAddress.value);
    }
  });
};

// Геокодирование адреса (адрес -> координаты)
const geocodeAddress = (address) => {
  if (!ymaps || !address || !map.value || !placemark.value) {
    return Promise.resolve(false);
  }

  // Согласно документации, geocode возвращает Promise
  return ymaps.geocode(address, { results: 1 })
    .then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (!firstGeoObject) {
        searchError.value = "Адрес не найден. Уточните запрос.";
        return false;
      }

      const coords = firstGeoObject.geometry.getCoordinates();
      const fullAddress = firstGeoObject.getAddressLine();

      map.value.setCenter(coords, 16, { duration: 300 });
      placemark.value.geometry.setCoordinates(coords);
      placemark.value.properties.set("balloonContent", fullAddress);

      selectedAddress.value = fullAddress;
      emit("update:modelValue", fullAddress);
      searchError.value = "";
      return true;
    })
    .catch((err) => {
      console.error("Ошибка геокодирования:", err);
      searchError.value = "Не удалось выполнить поиск. Проверьте API ключ или попробуйте позже.";
      return false;
    });
};

// Обратное геокодирование (координаты -> адрес)
const geocodeCoordinates = (coords) => {
  if (!ymaps) return;

  ymaps.geocode(coords)
    .then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        const fullAddress = firstGeoObject.getAddressLine();
        selectedAddress.value = fullAddress;
        emit("update:modelValue", fullAddress);
        placemark.value.properties.set("balloonContent", fullAddress);
        searchError.value = "";
      }
    })
    .catch((err) => {
      console.error("Ошибка обратного геокодирования:", err);
      searchError.value = "Не удалось определить адрес по координатам.";
    });
};

// Обработка ввода адреса
const handleInput = (event) => {
  const value = event.target.value;
  selectedAddress.value = value;
  emit("update:modelValue", value);
  showSuggestions.value = value.length > 2;
};

// Обработка поиска по адресу
const handleSearch = () => {
  if (!selectedAddress.value.trim()) {
    searchError.value = "Введите адрес перед поиском.";
    return;
  }

  if (!isMapReady.value) {
    searchError.value = "Карта еще загружается. Попробуйте чуть позже.";
    return;
  }

  isSearching.value = true;
  searchError.value = "";
  
  geocodeAddress(selectedAddress.value.trim())
    .then(() => {
      isSearching.value = false;
    })
    .catch(() => {
      isSearching.value = false;
    });
};

// Обработка Enter в поле ввода
const handleKeydown = (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
};

// Определение местоположения пользователя
const getUserLocation = () => {
  if (!navigator.geolocation) {
    alert("Геолокация не поддерживается вашим браузером");
    return;
  }

  if (!map.value || !isMapReady.value) {
    alert("Карта еще не загружена. Пожалуйста, подождите.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const coords = [position.coords.latitude, position.coords.longitude];
      if (map.value && placemark.value) {
        map.value.setCenter(coords, 16, { duration: 300 });
        placemark.value.geometry.setCoordinates(coords);
        geocodeCoordinates(coords);
      }
    },
    (error) => {
      console.error("Ошибка получения геолокации:", error);
      alert("Не удалось определить ваше местоположение");
    }
  );
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== selectedAddress.value) {
      selectedAddress.value = newValue || "";
      if (newValue && map.value && isMapReady.value) {
        geocodeAddress(newValue);
      }
    }
  }
);

onMounted(() => {
  // Ждем загрузки Яндекс.Карт
  if (typeof window.ymaps !== "undefined") {
    initMap();
  } else {
    // Если карты еще не загружены, ждем
    const checkYmaps = setInterval(() => {
      if (typeof window.ymaps !== "undefined") {
        clearInterval(checkYmaps);
        initMap();
      }
    }, 100);

    // Таймаут на случай, если карты не загрузятся
    setTimeout(() => {
      clearInterval(checkYmaps);
      if (typeof window.ymaps === "undefined") {
        console.error("Яндекс.Карты не загрузились");
        searchError.value = "Не удалось загрузить Яндекс.Карты. Обновите страницу.";
      }
    }, 10000);
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.destroy();
  }
  isMapReady.value = false;
});
</script>

<template>
  <div class="yandex-map-address-picker">
    <div class="address-input-wrapper">
      <div class="input-group">
        <input
          ref="addressInput"
          :value="selectedAddress"
          type="text"
          :placeholder="placeholder"
          @input="handleInput"
          @keydown="handleKeydown"
          class="address-input"
        />
        <button
          type="button"
          @click="handleSearch"
          class="btn-search"
          :disabled="!isMapReady || isSearching"
          title="Найти на карте"
        >
          {{ isSearching ? "…" : "🔍" }}
        </button>
        <button
          type="button"
          @click="getUserLocation"
          class="btn-location"
          title="Мое местоположение"
        >
          📍
        </button>
      </div>
      <div ref="suggestionsContainer" class="suggestions-container"></div>
    </div>
    <p v-if="searchError" class="error-message">{{ searchError }}</p>
    <div ref="mapContainer" class="map-container">
      <div v-if="!isMapReady" class="map-loader">Загрузка карты…</div>
    </div>
    <div class="map-hint">
      💡 Кликните на карте или перетащите метку для выбора адреса
    </div>
  </div>
</template>

<style scoped>
.yandex-map-address-picker {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.address-input-wrapper {
  position: relative;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.address-input {
  flex: 1;
  padding: 0.65rem;
  border: 1px solid #cbd5f5;
  border-radius: 0.5rem;
  font-size: 1rem;
}

.address-input:focus {
  outline: none;
  border-color: #2563eb;
}

.btn-search,
.btn-location {
  padding: 0.65rem 1rem;
  border: 1px solid #cbd5f5;
  border-radius: 0.5rem;
  background: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-search:hover,
.btn-location:hover {
  background: #f8fafc;
  border-color: #2563eb;
}

.btn-search:disabled {
  cursor: not-allowed;
  background: #e2e8f0;
  border-color: #cbd5f5;
  color: #94a3b8;
}

.map-container {
  width: 100%;
  height: 400px;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #cbd5f5;
}

.map-hint {
  font-size: 0.85rem;
  color: #64748b;
  text-align: center;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 0.5rem;
}

.error-message {
  color: #dc2626;
  font-size: 0.85rem;
  margin: -0.25rem 0 0 0;
}

.map-loader {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 250, 252, 0.9);
  color: #475569;
  font-size: 0.95rem;
}

.suggestions-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  margin-top: 0.25rem;
}
</style>

