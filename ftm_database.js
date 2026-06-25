const ftmDatabase = [
    {
        id: "ftm_steak_tartare",
        name: "Steak Tartare de Wagyu",
        sector: "ENTRADAS 1",
        checklist_link: "Tartare de Wagyu",
        yieldLote: 10,
        yieldUnit: "porções",
        prepContainer: "GN fria",
        shelfLife: "2 dias",
        ingredients: [
            { name: "Tartare de Filé", qtd: 100, unit: "g" },
            { name: "Ovas de massago black", qtd: 30, unit: "g" },
            { name: "Crocante de nori", qtd: 30, unit: "g" },
            { name: "Maionese de ponzu", qtd: 7, unit: "g" },
            { name: "Cebola Frita", qtd: 15, unit: "g" },
            { name: "Cebola Roxa (Brunoise)", qtd: 15, unit: "g" },
            { name: "Pimenta Tobojaum", qtd: 10, unit: "g" },
            { name: "Molho de Ostra", qtd: 10, unit: "g" },
            { name: "Picles e Alcaparras", qtd: 15, unit: "g" }
        ],
        process: [
            "1. Processo de Corte: Limpar e cortar o filé em brunoise (ponta de faca) e manter na GN sobre o gelo.",
            "2. Mistura Base: Incorporar a maionese de ponzu, ostra, picles, alcaparras e cebola roxa.",
            "3. Finalização / Empratamento: Moldar com aro, dispor as ovas, cebola frita e crocante de nori por cima."
        ]
    },
    {
        id: "ftm_ceviche",
        name: "Ceviche Romerito",
        sector: "ENTRADAS 1",
        checklist_link: "Ceviche",
        yieldLote: 5,
        yieldUnit: "porções",
        prepContainer: "GN fria / Pote 1L",
        shelfLife: "1 dia",
        ingredients: [
            { name: "Pescado do dia", qtd: 200, unit: "g" },
            { name: "Camarões rosa", qtd: 100, unit: "g" },
            { name: "Leche de tigre", qtd: 100, unit: "ml" },
            { name: "Suco de limão", qtd: 80, unit: "ml" },
            { name: "Cebola roxa", qtd: 30, unit: "g" },
            { name: "Chips de camote", qtd: 30, unit: "g" },
            { name: "Milho tostado", qtd: 20, unit: "g" },
            { name: "Pimenta dedo-de-moça", qtd: 5, unit: "g" },
            { name: "Coentro", qtd: 5, unit: "g" },
            { name: "Sal", qtd: "a gosto", unit: "" }
        ],
        process: [
            "1. Corte: Cortar o pescado em cubos médios uniformes.",
            "2. Leche de Tigre: Emulsionar aparas com limão, coentro, alho e pimenta. Coar e reservar no frio.",
            "3. Branqueamento: Branquear os camarões rapidamente em água com sal, resfriar no banho de gelo.",
            "4. Assemblagem: Misturar os frutos do mar no leite de tigre, adicionar cebola roxa em pluma e finalizar com chips e milho."
        ]
    },
    {
        id: "ftm_punheta_bacalhau",
        name: "Punheta de Bacalhau",
        sector: "ENTRADAS 2",
        checklist_link: "Punheta de Bacalhau",
        yieldLote: 8,
        yieldUnit: "porções",
        prepContainer: "Pote M",
        shelfLife: "3 dias",
        ingredients: [
            { name: "Bacalhau desfiado dessalgado", qtd: 150, unit: "g" },
            { name: "Batatinhas cozidas", qtd: 100, unit: "g" },
            { name: "Cebola roxa", qtd: 50, unit: "g" },
            { name: "Azeite extra-virgem", qtd: 40, unit: "ml" },
            { name: "Azeitonas pretas", qtd: 30, unit: "g" },
            { name: "Pimentão vermelho", qtd: 30, unit: "g" },
            { name: "Salsa picada", qtd: 10, unit: "g" },
            { name: "Pãozinho artesanal", qtd: 2, unit: "un" }
        ],
        process: [
            "1. Preparo do Bacalhau: Garantir dessalga prévia em água gelada (trocas a cada 6h).",
            "2. Mise en place: Desfiar o bacalhau finamente com as mãos. Fatiar a cebola e pimentão.",
            "3. Emulsão: Misturar todos os ingredientes, incorporando o azeite lentamente para gerar uma leve emulsão natural com a gelatina do peixe.",
            "4. Armazenamento: Guardar em pote de fechamento hermético coberto com um fio extra de azeite."
        ]
    },
    {
        id: "ftm_lulinha_asiatica",
        name: "Lulinha Asiática",
        sector: "ENTRADAS 1",
        checklist_link: "Arañita / Lulinha",
        yieldLote: 6,
        yieldUnit: "porções",
        prepContainer: "GN Fria",
        shelfLife: "2 dias",
        ingredients: [
            { name: "Tentáculos de lula", qtd: 200, unit: "g" },
            { name: "Molho oriental agridoce", qtd: 80, unit: "ml" },
            { name: "Shoyu", qtd: 30, unit: "ml" },
            { name: "Azeite de gergelim", qtd: 15, unit: "ml" },
            { name: "Gengibre", qtd: 10, unit: "g" },
            { name: "Alho", qtd: 2, unit: "dentes" },
            { name: "Salsinha", qtd: "a gosto", unit: "" },
            { name: "Pãozinho artesanal", qtd: 2, unit: "un" }
        ],
        process: [
            "1. Limpeza: Limpar rigorosamente os tentáculos e secar bem.",
            "2. Marinação Base: Misturar o shoyu, gengibre ralado, alho amassado e azeite de gergelim.",
            "3. Cocção: Saltear em fogo extremamente alto (wok ou parrilla) por poucos segundos para não encrachar.",
            "4. Glaceadura: Envolver os tentáculos quentes no molho agridoce e finalizar."
        ]
    }
];
