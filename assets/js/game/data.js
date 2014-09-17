// dinosaurs library
app.data.dinosaurs = [
    {
        name: 'Trilobite paradoxides',
        slug: 'trilobite',
        strength: 'water',
        weakness: 'air'
    },
    {
        name: 'Deinonychus antirrhopus',
        slug: 'deinonychus',
        strength: 'earth',
        weakness: 'water'
    },
    {
        name: 'Pteranodon longiceps',
        slug: 'pteranodon',
        strength: 'air',
        weakness: 'earth'
    }
];

// sprite library for smarter loading
app.data.sprites = [
    { type: 'background', slug: 'swamp', extension: 'png', path: 'backgrounds/'},
    { type: 'dinosaur', slug: 'trilobite', extension: 'png', path: 'dinosaurs/'},
    { type: 'dinosaur', slug: 'deinonychus', extension: 'png', path: 'dinosaurs/'},
    { type: 'dinosaur', slug: 'pteranodon', extension: 'png', path: 'dinosaurs/'}
];

// generate stages
app.data.stages = app.helpers.generateStages(3);
