import { Recipe } from '../types';

export const SEED_RECIPES: Recipe[] = [
  {
    id: 'seed_carbonara',
    title: 'Классическая Паста Карбонара',
    description: 'Настоящая римская карбонара без сливок — только яичные желтки, гуанчиале (или грудинка) и выдержанный сыр.',
    category: 'Горячее',
    servings: 2,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    ingredients: [
      { id: 'i1', name: 'Спагетти (из твердых сортов)', amount: 200, unit: 'g' },
      { id: 'i2', name: 'Гуанчиале или сыровяленая грудинка', amount: 120, unit: 'g', substitutes: ['Бекон', 'Панчетта'] },
      { id: 'i3', name: 'Яичные желтки', amount: 3, unit: 'pcs' },
      { id: 'i4', name: 'Сыр Пекорино Романо', amount: 50, unit: 'g', substitutes: ['Пармезан'] },
      { id: 'i5', name: 'Свежемолотый черный перец', amount: 1, unit: 'tsp' },
      { id: 'i6', name: 'Соль для воды', amount: 1, unit: 'tbsp' }
    ],
    steps: [
      {
        id: 's1',
        stepNumber: 1,
        instruction: 'Нарежьте гуанчиале небольшими кубиками или брусочками. Поставьте сухую сковороду на средний огонь и обжаривайте мясо до вытапливания жира и румяной корочки.',
        timerDurationSeconds: 480, // 8 min
        tips: 'Не добавляйте растительное масло — мясу хватит собственного вытопленного жира.',
        ingredients: [
          { id: 'si_c1', name: 'Гуанчиале или сыровяленая грудинка', amount: 120, unit: 'g' }
        ]
      },
      {
        id: 's2',
        stepNumber: 2,
        instruction: 'В глубокой миске взбейте желтки с мелко натертым сыром и щедрой порцией свежемолотого черного перца до состояния густого крема.',
        tips: 'Оставьте немного сыра для подачи.',
        ingredients: [
          { id: 'si_c2', name: 'Яичные желтки', amount: 3, unit: 'pcs' },
          { id: 'si_c3', name: 'Сыр Пекорино Романо', amount: 50, unit: 'g' },
          { id: 'si_c4', name: 'Свежемолотый черный перец', amount: 1, unit: 'tsp' }
        ]
      },
      {
        id: 's3',
        stepNumber: 3,
        instruction: 'Отварите спагетти в кипящей подсоленной воде до состояния al dente (примерно на 1-2 минуты меньше времени на упаковке). Сохраните 1 стакан воды из-под пасты!',
        timerDurationSeconds: 540, // 9 min
        ingredients: [
          { id: 'si_c5', name: 'Спагетти (из твердых сортов)', amount: 200, unit: 'g' },
          { id: 'si_c6', name: 'Соль для воды', amount: 1, unit: 'tbsp' }
        ]
      },
      {
        id: 's4',
        stepNumber: 4,
        instruction: 'Переложите горячие спагетти в сковороду с обжаренным мясом, снимите сковороду с огня. Влейте яично-сырную смесь и быстро перемешивайте, подливая по 2-3 ложки горячей воды от пасты до образования шелковистого соуса.',
        tips: 'Главное правило: сковорода должна быть снята с огня, чтобы желтки не свернулись в яичницу.',
        ingredients: []
      }
    ]
  },
  {
    id: 'seed_syrniki',
    title: 'Пышные Ванильные Сырники',
    description: 'Нежные и пышные сырники с золотистой корочкой и ароматом натуральной ванили.',
    category: 'Закуски',
    servings: 3,
    isFavorite: true,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now() - 86400000 * 2,
    ingredients: [
      { id: 'i10', name: 'Творог 9% (сухой, отжатый)', amount: 400, unit: 'g' },
      { id: 'i11', name: 'Яичный желток', amount: 1, unit: 'pcs' },
      { id: 'i12', name: 'Сахарная пудра', amount: 2, unit: 'tbsp', substitutes: ['Сахар'] },
      { id: 'i13', name: 'Мука пшеничная (или рисовая)', amount: 2, unit: 'tbsp' },
      { id: 'i14', name: 'Ванильный экстракт', amount: 0.5, unit: 'tsp' },
      { id: 'i15', name: 'Масло сливочное для жарки', amount: 30, unit: 'g' }
    ],
    steps: [
      {
        id: 's10',
        stepNumber: 1,
        instruction: 'Творог тщательно протираем через сито или разминаем вилкой до однородной массы без комочков.',
        tips: 'Чем суше творог, тем меньше потребуется муки и тем нежнее будут сырники.',
        ingredients: [
          { id: 'si_s1', name: 'Творог 9% (сухой, отжатый)', amount: 400, unit: 'g' }
        ]
      },
      {
        id: 's11',
        stepNumber: 2,
        instruction: 'Добавляем желток, сахарную пудру, ваниль и 1 столовую ложку муки. Тщательно перемешиваем до плотного теста.',
        ingredients: [
          { id: 'si_s2', name: 'Яичный желток', amount: 1, unit: 'pcs' },
          { id: 'si_s3', name: 'Сахарная пудра', amount: 2, unit: 'tbsp' },
          { id: 'si_s4', name: 'Ванильный экстракт', amount: 0.5, unit: 'tsp', isOptional: true },
          { id: 'si_s5', name: 'Мука пшеничная (или рисовая)', amount: 1, unit: 'tbsp' }
        ]
      },
      {
        id: 's12',
        stepNumber: 3,
        instruction: 'Формуем аккуратные шарики, обваливаем в оставшейся муке и подравниваем ножом или стаканом для идеальной круглой формы.',
        ingredients: [
          { id: 'si_s6', name: 'Мука пшеничная (или рисовая)', amount: 1, unit: 'tbsp' }
        ]
      },
      {
        id: 's13',
        stepNumber: 4,
        instruction: 'Жарим на среднем огне на смеси сливочного и растительного масла по 3-4 минуты с каждой стороны под крышкой до румяной корочки.',
        timerDurationSeconds: 240, // 4 min
        ingredients: [
          { id: 'si_s7', name: 'Масло сливочное для жарки', amount: 30, unit: 'g' }
        ]
      }
    ]
  },
  {
    id: 'seed_brownie',
    title: 'Шоколадный Брауни с Грецким Орехом',
    description: 'Густой влажный брауни с хрустящей корочкой, поджаренными орехами и глубоким вкусом темного шоколада.',
    category: 'Выпечка',
    servings: 6,
    isFavorite: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    ingredients: [
      { id: 'i20', name: 'Темный шоколад 70%', amount: 200, unit: 'g' },
      { id: 'i21', name: 'Сливочное масло 82%', amount: 150, unit: 'g' },
      { id: 'i22', name: 'Яйца куриные (крупные)', amount: 3, unit: 'pcs' },
      { id: 'i23', name: 'Сахар', amount: 150, unit: 'g' },
      { id: 'i24', name: 'Мука пшеничная', amount: 90, unit: 'g' },
      { id: 'i25', name: 'Какао-порошок', amount: 2, unit: 'tbsp' },
      { id: 'i26', name: 'Грецкие орехи (обжаренные)', amount: 100, unit: 'g' },
      { id: 'i27', name: 'Морская соль', amount: 1, unit: 'pinch' }
    ],
    steps: [
      {
        id: 's20',
        stepNumber: 1,
        instruction: 'Растопите шоколад и сливочное масло на водяной бане или в микроволновке импульсами по 15 секунд. Остудите до теплого состояния.',
        ingredients: [
          { id: 'si_b1', name: 'Темный шоколад 70%', amount: 200, unit: 'g' },
          { id: 'si_b2', name: 'Сливочное масло 82%', amount: 150, unit: 'g' }
        ]
      },
      {
        id: 's21',
        stepNumber: 2,
        instruction: 'Взбейте яйца с сахаром миксером в течение 3-4 минут до пышной светлой пены.',
        timerDurationSeconds: 240,
        ingredients: [
          { id: 'si_b3', name: 'Яйца куриные (крупные)', amount: 3, unit: 'pcs' },
          { id: 'si_b4', name: 'Сахар', amount: 150, unit: 'g' }
        ]
      },
      {
        id: 's22',
        stepNumber: 3,
        instruction: 'Аккуратно соедините шоколадную массу со взбитыми яйцами, просейте муку, какао и щепотку соли. Добавьте рубленые орехи.',
        ingredients: [
          { id: 'si_b5', name: 'Мука пшеничная', amount: 90, unit: 'g' },
          { id: 'si_b6', name: 'Какао-порошок', amount: 2, unit: 'tbsp' },
          { id: 'si_b7', name: 'Морская соль', amount: 1, unit: 'pinch' },
          { id: 'si_b8', name: 'Грецкие орехи (обжаренные)', amount: 100, unit: 'g', isOptional: true }
        ]
      },
      {
        id: 's23',
        stepNumber: 4,
        instruction: 'Выложите тесто в форму с пергаментом и выпекайте при 175°C ровно 25 минут.',
        timerDurationSeconds: 1500, // 25 min
        tips: 'Зубочистка должна выходить с влажными крошками. Не пересушите!',
        ingredients: []
      }
    ]
  }
];
