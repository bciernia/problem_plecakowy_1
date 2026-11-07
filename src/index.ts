const DECIMALS = 4;
const SCALE = 10 ** DECIMALS;

const evaluate = (x: boolean[], weights: number[], capacity: number): number => {
    let weight = 0;
    x.forEach((taken, i) => {
        if (taken) weight += weights[i] ?? 0;
    });
    return weight <= capacity ? weight : 0;
}

const mutate = (x: boolean[]): boolean[] => {
    const y = [...x];
    const i = Math.floor(Math.random() * x.length);
    y[i] = !y[i];
    return y;
}

const evolutionStrategy = (weights: number[], capacity: number, generations = 200000) => {
    let parent: boolean[] = new Array(weights.length).fill(false);
    let parentFit = evaluate(parent, weights, capacity);
    let parentBetter = 0;
    let childBetter = 0;
    let equal = 0;

    for (let g = 1; g <= generations; g++) {
        const child = mutate(parent);
        const childFit = evaluate(child, weights, capacity);

        if (childFit > parentFit) childBetter++;
        else if (childFit < parentFit) parentBetter++;
        else equal++;

        if (childFit >= parentFit) {
            parent = child;
            parentFit = childFit;
        }
    }

    return { solution: parent, weight: parentFit, trials: generations, parentBetter, childBetter, equal };
}

const optimumDP = (weights: number[], capacity: number): number => {
    const cap = Math.round(capacity * SCALE);
    const reachable = new Array(cap + 1).fill(false);
    reachable[0] = true;
    for (const weight of weights) {
        const scaled = Math.round(weight * SCALE);
        for (let w = cap; w >= scaled; w--) {
            if (reachable[w - scaled]) reachable[w] = true;
        }
    }
    let best = cap;
    while (!reachable[best]) best--;
    return best / SCALE;
}

const randFloat = (min: number, max: number) => Math.round((min + Math.random() * (max - min)) * SCALE) / SCALE;

const weights: number[] = Array.from({ length: 50 }, () => randFloat(1, 30));
const capacity = Math.round(weights.reduce((s, w) => s + w, 0) / 2 * SCALE) / SCALE;

const { solution, weight, trials, parentBetter, childBetter, equal } = evolutionStrategy(weights, capacity);
const chosen = solution.flatMap((taken, i) => (taken ? [i] : []));
const optimum = optimumDP(weights, capacity);

console.log(`Pojemność plecaka: ${capacity.toFixed(DECIMALS)}`);
console.log(`Wagi przedmiotów: ${weights.map((w) => w.toFixed(DECIMALS)).join(", ")}`);
console.log(`Wybrane przedmioty: ${chosen.join(", ")}`);
console.log(`Zajęta waga ${weight.toFixed(DECIMALS)} (wolne miejsce ${(capacity - weight).toFixed(DECIMALS)})`);
console.log(`Optimum: ${optimum.toFixed(DECIMALS)} -> ${(100 * weight / optimum).toFixed(4)}%`);
console.log(`Liczba prób: ${trials}`);
console.log(`Rodzic lepszy (potomek odrzucony): ${parentBetter}`);
console.log(`Potomek lepszy (zamiana): ${childBetter}`);
console.log(`Remis (potomek przyjęty): ${equal}`);