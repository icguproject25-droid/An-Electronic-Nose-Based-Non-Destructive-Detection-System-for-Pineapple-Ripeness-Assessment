export interface KnowledgeCategory {
  id: string;
  title: { zh: string; en: string };
  icon: string;
  items: KnowledgeItem[];
}

export interface KnowledgeItem {
  id: string;
  question: { zh: string; en: string };
  answer: { zh: string; en: string };
}

export const knowledgeCategories: KnowledgeCategory[] = [
  {
    id: 'disease',
    title: { zh: '病菌危害', en: 'Disease & Pests' },
    icon: 'bug',
    items: [
      {
        id: 'd1',
        question: {
          zh: '什麼是鳳梨凋萎病 (Wilt Disease)？',
          en: 'What is Pineapple Wilt Disease?',
        },
        answer: {
          zh: '凋萎病是由粉介殼蟲傳播的病毒引起，會導致鳳梨葉片從尖端開始變紅、變黃，最後整株枯萎。受感染的植株果實會變小、品質下降。消費者購買時應注意果實是否有異常萎縮或外皮顏色不均勻。',
          en: 'Wilt Disease is caused by a virus transmitted by mealybugs. It causes pineapple leaves to turn red and yellow from the tips, eventually killing the entire plant. Infected plants produce smaller, lower-quality fruit. When buying, check for abnormal shrinkage or uneven skin color.',
        },
      },
      {
        id: 'd2',
        question: {
          zh: '什麼是鳳梨心腐病 (Heart Rot)？',
          en: 'What is Pineapple Heart Rot?',
        },
        answer: {
          zh: '心腐病由疫病菌 (Phytophthora) 引起，病菌從心部侵入，導致鳳梨內部腐爛變黑。外表看似正常，切開後才發現果心已變褐色或黑色且有異味。消費者應注意：若果實底部有不正常的黑點、按壓有軟爛感，或聞到發酵異味，應避免購買。',
          en: 'Heart Rot is caused by Phytophthora fungi that invade from the center, causing the inside to rot and turn black. The exterior may look normal, but cutting reveals brown/black discoloration and off-odors. Avoid fruit with abnormal dark spots at the base, soft spots when pressed, or fermented smells.',
        },
      },
      {
        id: 'd3',
        question: {
          zh: '如何觀察果實外觀判斷健康狀態？',
          en: 'How to inspect fruit appearance for health?',
        },
        answer: {
          zh: '健康的鳳梨應該：果皮顏色均勻（由綠轉黃為正常成熟）、果目飽滿無凹陷、無不正常黑點或水漬狀斑點、底部無霉斑、冠芽翠綠挺立。若發現果皮有大面積深色斑塊、底部滲液或有酒精味，建議不要購買。',
          en: 'Healthy pineapples should have: even skin color (green to yellow is normal ripening), plump eyes without indentations, no abnormal dark spots or water-soaked patches, no mold at the base, and fresh upright crown leaves. Avoid buying if you see large dark patches, leaking at the base, or an alcohol smell.',
        },
      },
      {
        id: 'd4',
        question: {
          zh: '什麼是黑腐病 (Black Rot)？',
          en: 'What is Black Rot?',
        },
        answer: {
          zh: '這主要發生在採收後的運輸過程中。病原菌從果實的傷口侵入，導致果肉變黑並軟化腐爛，是影響外銷與存放的主要殺手。',
          en: 'Black Rot mainly occurs during post-harvest transportation. Pathogens invade through wounds on the fruit, causing the flesh to turn black, soften, and rot. It is a major threat to export quality and storage life.',
        },
      },
      {
        id: 'd5',
        question: {
          zh: '什麼是黑目病 (小果腐敗病, Fruitlet Core Rot)？',
          en: 'What is Fruitlet Core Rot (Black Eye Disease)?',
        },
        answer: {
          zh: '這是一種非常棘手的病害。果實外觀可能完全正常，但切開後內部的「小果果心」會呈現褐色或黑色的軟腐現象。因為從外表難以篩選，對消費者與農民都造成困擾。',
          en: 'This is a very tricky disease. The fruit may appear completely normal on the outside, but when cut open, the inner "fruitlet cores" show brown or black soft rot. Because it cannot be detected from the exterior, it causes trouble for both consumers and farmers.',
        },
      },
      {
        id: 'd6',
        question: {
          zh: '什麼是赤色病 (Pink Disease) 與花樟病 (Marbled Fruit)？',
          en: 'What are Pink Disease and Marbled Fruit?',
        },
        answer: {
          zh: '這兩者皆為細菌性病害。\n\n赤色病：平時看不出來，但果肉在加熱煮沸（如做果醬或煮鳳梨苦瓜雞）時會突然轉為粉紅色。\n\n花樟病：會導致果肉組織硬化，呈現紅褐色的「木質化」現象。',
          en: 'Both are bacterial diseases.\n\nPink Disease: Not visible under normal conditions, but the flesh suddenly turns pink when heated or boiled (e.g., making jam or pineapple bitter melon chicken soup).\n\nMarbled Fruit: Causes the flesh tissue to harden and develop a reddish-brown "lignification" (woody texture) phenomenon.',
        },
      },
      {
        id: 'd7',
        question: {
          zh: '線蟲會對鳳梨造成什麼影響？',
          en: 'How do nematodes affect pineapples?',
        },
        answer: {
          zh: '根瘤線蟲或腎形線蟲會侵入鳳梨的根尖，造成根部腫瘤或破壞皮層。這會使根系變短、吸水能力變差，導致整株鳳梨營養不良甚至容易倒伏。',
          en: 'Root-knot nematodes or reniform nematodes invade the root tips of pineapples, causing root tumors or cortex damage. This shortens the root system, reduces water absorption capacity, and leads to malnutrition or even lodging (toppling over) of the entire plant.',
        },
      },
    ],
  },
  {
    id: 'growing',
    title: { zh: '種植過程', en: 'Growing Process' },
    icon: 'sprout',
    items: [
      {
        id: 'g1',
        question: {
          zh: '鳳梨從種植到採收需要多久？',
          en: 'How long from planting to harvest?',
        },
        answer: {
          zh: '鳳梨從裔芽（側芽）栽種到採收約需 18 個月。過程包括：定植（約 6-8 個月營養生長）→ 催花處理（使用電石或益收生長素）→ 開花（約 2 個月）→ 果實發育（約 5-6 個月）→ 採收。第二期宿根栽培則約 12 個月即可再次採收。',
          en: 'From planting a sucker (side shoot) to harvest takes about 18 months. The process: planting (6-8 months vegetative growth) → flower induction (using calcium carbide or ethephon) → flowering (about 2 months) → fruit development (about 5-6 months) → harvest. The second ratoon crop takes about 12 months.',
        },
      },
      {
        id: 'g2',
        question: {
          zh: '什麼是催花？為什麼需要催花？',
          en: 'What is flower induction and why is it needed?',
        },
        answer: {
          zh: '催花是人為促使鳳梨提早開花的技術。自然狀態下鳳梨會受日照長短與溫度影響才開花，時間不可控。農民使用電石（碳化鈣）或益收生長素（乙烯利），在植株長到足夠大時進行催花處理，這樣可以控制產期，確保市場穩定供應。',
          en: 'Flower induction is a technique to trigger early flowering. Naturally, pineapples flower based on day length and temperature, making timing unpredictable. Farmers use calcium carbide or ethephon when plants are large enough, allowing them to control harvest timing and ensure stable market supply.',
        },
      },
      {
        id: 'g3',
        question: {
          zh: '鳳梨的繁殖方式有哪些？',
          en: 'How are pineapples propagated?',
        },
        answer: {
          zh: '鳳梨主要有四種繁殖材料：冠芽（果頂的葉叢）、裔芽（莖上的側芽）、吸芽（地面附近的芽）、塊莖芽。商業栽培最常使用裔芽和吸芽，因為它們生長較快。冠芽雖然也可種植，但需要較長時間才能結果。',
          en: 'Pineapples have four main propagation materials: crown (leaf cluster on top), slips (side shoots on stem), suckers (shoots near ground level), and ratoon buds. Commercial farming mostly uses slips and suckers for faster growth. Crowns can be planted too but take longer to fruit.',
        },
      },
    ],
  },
  {
    id: 'chemistry',
    title: { zh: '化學小知識', en: 'Chemistry Facts' },
    icon: 'flask',
    items: [
      {
        id: 'c1',
        question: {
          zh: '為什麼吃鳳梨會「咬舌」？',
          en: 'Why does pineapple "bite" your tongue?',
        },
        answer: {
          zh: '鳳梨含有豐富的鳳梨酵素（Bromelain），這是一種蛋白質分解酵素。當你吃鳳梨時，這種酵素會分解口腔黏膜上的蛋白質，造成刺痛感，就像鳳梨在「咬」你的舌頭。小技巧：用鹽水浸泡鳳梨 10 分鐘可以降低酵素活性，減少刺痛感。加熱烹煮也能使酵素失活。',
          en: 'Pineapple is rich in Bromelain, a protease enzyme. When you eat pineapple, this enzyme breaks down proteins on your oral mucosa, causing a stinging sensation — like the pineapple is "biting" you back. Tip: Soaking pineapple in salt water for 10 minutes reduces enzyme activity. Cooking also deactivates it.',
        },
      },
      {
        id: 'c2',
        question: {
          zh: '鳳梨酵素有什麼健康益處？',
          en: 'What are the health benefits of Bromelain?',
        },
        answer: {
          zh: '鳳梨酵素能分解蛋白質，幫助消化肉類食物，這就是為什麼鳳梨常與肉類料理搭配。此外，研究顯示鳳梨酵素具有抗發炎、減輕腫脹、促進傷口癒合等功效。它也被用於醫學上作為消炎和去水腫的輔助用藥。鳳梨的果芯含有最高濃度的鳳梨酵素。',
          en: 'Bromelain breaks down proteins, aiding digestion of meat — this is why pineapple is often paired with meat dishes. Research shows it has anti-inflammatory properties, reduces swelling, and promotes wound healing. It is also used medically as an anti-inflammatory. The fruit core contains the highest concentration of Bromelain.',
        },
      },
      {
        id: 'c3',
        question: {
          zh: '鳳梨的糖酸比是什麼？',
          en: 'What is the sugar-acid ratio in pineapple?',
        },
        answer: {
          zh: '糖酸比是衡量鳳梨風味的重要指標，計算方式為糖度（Brix）除以酸度（%）。一般金鑽鳳梨的糖度約 14-18°Brix，酸度約 0.4-0.8%。糖酸比越高，吃起來越甜；糖酸比越低，口感越酸。大部分人偏好糖酸比在 20-40 之間的鳳梨。',
          en: 'The sugar-acid ratio measures pineapple flavor, calculated as sweetness (Brix) divided by acidity (%). Tainung No.17 typically has 14-18°Brix sweetness and 0.4-0.8% acidity. Higher ratio = sweeter taste; lower ratio = more sour. Most people prefer pineapples with a sugar-acid ratio between 20-40.',
        },
      },
    ],
  },
  {
    id: 'history',
    title: { zh: '歷史與種類', en: 'History & Origins' },
    icon: 'globe',
    items: [
      {
        id: 'h1',
        question: {
          zh: '鳳梨的起源在哪裡？',
          en: 'Where did pineapples originate?',
        },
        answer: {
          zh: '鳳梨原產於南美洲的巴拉圭與巴西南部地區，原住民已種植數千年。1493 年哥倫布第二次航行時在加勒比海的瓜德羅普島首次接觸鳳梨，並帶回歐洲。隨後鳳梨經由大航海時代傳播到亞洲、非洲等熱帶地區。',
          en: 'Pineapples originated in Paraguay and southern Brazil in South America, cultivated by indigenous peoples for thousands of years. Columbus first encountered pineapples on Guadeloupe during his second voyage in 1493 and brought them to Europe. They then spread to Asia, Africa, and other tropical regions during the Age of Exploration.',
        },
      },
      {
        id: 'h2',
        question: {
          zh: '台灣如何成為鳳梨王國？',
          en: 'How did Taiwan become a pineapple kingdom?',
        },
        answer: {
          zh: '台灣鳳梨栽培始於清朝時期，日治時代大量發展罐頭加工外銷。1970 年代台灣曾是全球最大鳳梨罐頭出口國。之後隨著產業轉型，台灣農業試驗所持續育種改良，從台農 1 號到台農 23 號，培育出適合鮮食的優良品種，尤其台農 17 號（金鑽鳳梨）的成功讓台灣鳳梨從加工轉向鮮食市場，品質享譽國際。',
          en: 'Taiwan\'s pineapple cultivation began during the Qing Dynasty and expanded greatly during Japanese rule for canned exports. In the 1970s, Taiwan was the world\'s largest canned pineapple exporter. Taiwan\'s Agricultural Research Institute continuously bred improved varieties from Tainung No.1 to No.23. The success of Tainung No.17 (Golden Diamond) shifted Taiwan\'s pineapple industry from processing to fresh fruit, earning international acclaim.',
        },
      },
      {
        id: 'h3',
        question: {
          zh: '全世界有多少種鳳梨？',
          en: 'How many pineapple varieties exist worldwide?',
        },
        answer: {
          zh: '全世界的鳳梨品種超過 100 種，但商業栽培的主要品種約 30-40 種。主要分為四大品系：開英種（Cayenne，全球最廣泛）、皇后種（Queen）、西班牙種（Spanish）、摩里西斯種（Mauritius）。台灣主要種植的是開英種系統改良而來的品種，以及各種雜交育種的台農系列品種。',
          en: 'Over 100 pineapple varieties exist worldwide, but only 30-40 are commercially cultivated. They fall into four main groups: Cayenne (most widespread globally), Queen, Spanish, and Mauritius. Taiwan mainly grows improved Cayenne-derived varieties and various crossbred Tainung series varieties.',
        },
      },
    ],
  },
];
