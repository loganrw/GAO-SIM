import { Injectable } from '@angular/core';
import { uniqueNamesGenerator, Config, adjectives, animals, NumberDictionary } from 'unique-names-generator';

@Injectable({
    providedIn: 'root'
})
export class NameGenService {

    numberGenerator = NumberDictionary.generate({ min: 1, max: 99 });
    config: Config = {
        dictionaries: [adjectives, animals, this.numberGenerator],
        separator: '',
        length: 3,
        style: 'capital'
    }

    generateName() {
        return uniqueNamesGenerator(this.config);
    }
}
