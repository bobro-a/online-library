import http from 'k6/http';
import { sleep } from 'k6';

export let options = {
    vus: 50, // количество виртуальных пользователей
    duration: '30s', // продолжительность теста
};

export default function () {
    http.get('http://localhost:8081'); // путь к твоему сайту
    sleep(1); // пауза между запросами
}