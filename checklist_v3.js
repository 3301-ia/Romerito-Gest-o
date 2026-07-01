const CHECKLIST_PDF_SCHEMA = {
    entradas1: {
        title: "ENTRADAS 1",
        volumeItems: [
            { id: 1, item: "Steak Tartare de Wagyu", sub: "moldado · GN frio" },
            { id: 2, item: "Carpaccio de Mignon", sub: "laminado · GN frio" },
            { id: 3, item: "Milho Doce", sub: "cubos · GN com tampa" },
            { id: 4, item: "Picolé Mineiro", sub: "embalado · freezer" },
            { id: 5, item: "Pastel de Queijo", sub: "cru · bandeja" },
            { id: 6, item: "Pastel de Bobó de Camarão", sub: "cru · bandeja" },
            { id: 7, item: "Sando de Atum", sub: "mise en place · GN" },
            { id: 8, item: "Arañita / Lulinha", sub: "tentáculos · GN frio" },
            { id: 9, item: "Tatake de Atum", sub: "pré-selado · GN frio" },
            { id: 10, item: "Salmão Curado", sub: "GN frio" },
            { id: 11, item: "Ceviche", sub: "mise en place · GN frio" },
            { id: 12, item: "Bolinho de Mandioca", sub: "cru · bandeja" },
            { id: 13, item: "Tulipinha de Frango", sub: "cru · bandeja" },
            { id: 14, item: "Croquete de Costela", sub: "cru · bandeja" },
            { id: 15, item: "Molho Pelati", sub: "bowl / squeeze" },
            { id: 16, item: "Maionese de Ostra / Ponzu", sub: "squeeze · frio" },
            { id: 17, item: "Maionese Kewpie", sub: "squeeze · frio" },
            { id: 18, item: "Pesto de Pistache", sub: "squeeze" },
            { id: 19, item: "Gremolata", sub: "bowl pequeno" },
            { id: 20, item: "Rúcula", sub: "bowl · frio" }
        ],
        countItems: [
            { id: 1, item: "Burrata (un.)", sub: "GN frio — contar unidades" },
            { id: 2, item: "Massa Fermentação Longa", sub: "porções · bandeja" }
        ]
    },
    entradas2: {
        title: "ENTRADAS 2",
        volumeItems: [
            { id: 1, item: "Fritas", sub: "bags · congelado" },
            { id: 2, item: "Cesto de Pães", sub: "porções · bandeja" },
            { id: 3, item: "Punheta de Bacalhau", sub: "mise en place · GN frio" },
            { id: 4, item: "Petit Tender Angus", sub: "GN frio" },
            { id: 5, item: "Salada", sub: "mise en place · bowl frio" },
            { id: 6, item: "Manteiga Trufada", sub: "ramekin / pote" },
            { id: 7, item: "Ovas de Tobiko / Massago", sub: "pote frio" },
            { id: 8, item: "Vinagrete Trufado", sub: "squeeze" },
            { id: 9, item: "Sriracha", sub: "squeeze" },
            { id: 10, item: "Molho de Iogurte", sub: "squeeze" },
            { id: 11, item: "Nozes Caramelizadas", sub: "pote" },
            { id: 12, item: "Crocante de Amendoim", sub: "pote" },
            { id: 13, item: "Chips de Camote", sub: "bowl / pote" },
            { id: 14, item: "Couvert — mise en place", sub: "bandeja / bowl" }
        ],
        countItems: [
            { id: 1, item: "Bags de Fritas — estoque", sub: "bags P / M / G" },
            { id: 2, item: "Pão Artesanal", sub: "unidades / porções" },
            { id: 3, item: "Gelato Mi Garba (Profiterole)", sub: "potes 1L / 5L" }
        ]
    },
    fogaoPasse: {
        title: "FOGÃO / PASSE",
        volumeItems: [
            { id: 1, item: "Purê de Funcho", sub: "GN · banho maria" },
            { id: 2, item: "Arroz de Romesco", sub: "GN · banho maria" },
            { id: 3, item: "Linguine Alfredo (pré-cozido)", sub: "GN · pré-cozido" },
            { id: 4, item: "Molho Roti", sub: "squeeze / bowl · quente" },
            { id: 5, item: "Molho Alfredo", sub: "GN · banho maria" },
            { id: 6, item: "Creme de Trufas", sub: "squeeze · frio" },
            { id: 7, item: "Beurre Blanc", sub: "bowl · banho maria" },
            { id: 8, item: "Camote Confit", sub: "GN" },
            { id: 9, item: "Aspargos (branqueados)", sub: "GN frio" },
            { id: 10, item: "Pupunha (laminada)", sub: "GN frio" },
            { id: 11, item: "Gremolata", sub: "bowl" },
            { id: 12, item: "Arroz Branco", sub: "GN · banho maria" },
            { id: 13, item: "Farofa de Ovos", sub: "GN" },
            { id: 14, item: "Batata Parrillera (pré-assada)", sub: "GN" },
            { id: 15, item: "Vegetais Parrilleros", sub: "GN" },
            { id: 16, item: "Sal Grosso / Parrilla", sub: "bowl ou ramekin" },
            { id: 17, item: "Chimichurri", sub: "squeeze / bowl" },
            { id: 18, item: "Vinagrete", sub: "squeeze / bowl" },
            { id: 19, item: "Molho de Cerveja Escura", sub: "squeeze" },
            { id: 20, item: "Farofa de Panko", sub: "bowl" },
            { id: 21, item: "Manteiga de Ervas", sub: "ramekin / pote" },
            { id: 22, item: "Limão / Cítrico", sub: "cortado · bowl" },
            { id: 23, item: "Tomilho / Ervas frescas", sub: "maço" },
            { id: 24, item: "Papel / Embalagem Parrilla", sub: "rolos / folhas" }
        ],
        countItems: [
            { id: 1, item: "Bags Linguine seco", sub: "bags – estoque" },
            { id: 2, item: "Potes Molho Roti", sub: "potes 1L / 3L" },
            { id: 3, item: "Potes Creme de Trufas", sub: "potes frios" },
            { id: 4, item: "Potes Romesco base", sub: "potes 3L / 5L" }
        ],
        passeAcarte: [
            { id: 1, item: "Polvo inteiro", sub: "tentáculo · UN", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 2, item: "Camarão Rosa", sub: "UN - 6 por porção", parLevels: { baixo: 15, medio: 25, alto: 40 } },
            { id: 3, item: "Pescado do dia", sub: "filé · UN", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 4, item: "Salmão (Curado / Tatake)", sub: "filé / porção · UN", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 5, item: "Atum (Tatake / Sando)", sub: "filé / porção · UN", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 6, item: "Lula (Arañita / Lulinha)", sub: "UN / porção", parLevels: { baixo: 15, medio: 25, alto: 40 } },
            { id: 7, item: "Filet Mignon A la carte", sub: "200g · UN", parLevels: { baixo: 15, medio: 30, alto: 50 } },
            { id: 8, item: "Filet Mignon Executivo", sub: "150g · PCT", parLevels: { baixo: 10, medio: 20, alto: 35 } },
            { id: 9, item: "Torneador Parmegiana", sub: "empanado · PCT", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 10, item: "Petit Tender Angus", sub: "6un / porção · PCT", parLevels: { baixo: 10, medio: 15, alto: 25 } }
        ]
    },
    parrilla: {
        title: "PARRILLA & PROTEÍNAS",
        parrillaAcarte: [
            { id: 1, item: "Picanha Angus", sub: "300g · UN", parLevels: { baixo: 15, medio: 30, alto: 50 } },
            { id: 2, item: "Ancho Angus", sub: "300g · UN", parLevels: { baixo: 15, medio: 30, alto: 50 } },
            { id: 3, item: "Flat Iron Angus", sub: "300g · UN", parLevels: { baixo: 10, medio: 20, alto: 35 } },
            { id: 4, item: "Fraldinha Angus", sub: "300g · UN", parLevels: { baixo: 10, medio: 20, alto: 35 } },
            { id: 5, item: "Denver Angus", sub: "200g · UN", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 6, item: "Chorizo", sub: "300g · UN", parLevels: { baixo: 15, medio: 25, alto: 45 } },
            { id: 7, item: "Assado de Tira Angus", sub: "200g · sous vide · PCT", parLevels: { baixo: 8, medio: 15, alto: 25 } },
            { id: 8, item: "Picanha de Cordeiro", sub: "350g · UN", parLevels: { baixo: 5, medio: 10, alto: 20 } },
            { id: 9, item: "Linguiça Artesanal de Ancho", sub: "300g · PCT", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 10, item: "Burger do Romerito", sub: "180g · patty · UN", parLevels: { baixo: 20, medio: 40, alto: 60 } }
        ],
        equipments: [
            { id: "carvao_estoque", label: "Carvão — estoque (bags)", type: "text" },
            { id: "temp_parrilla_1", label: "Temperatura Parrilla 1 (°C)", type: "number" },
            { id: "temp_parrilla_2", label: "Temperatura Parrilla 2 (°C)", type: "number" },
            { id: "obs_acendimento", label: "Acendimento / Observações", type: "text" }
        ]
    },
    fritadeira: {
        title: "FRITADEIRA",
        countItems: [
            { id: 1, item: "Fritas — Batata Parrillera", sub: "bags ou porções cruas" },
            { id: 2, item: "Fritas — Kids / Parmegiana", sub: "bags ou porções cruas" },
            { id: 3, item: "Pastel de Queijo", sub: "cru · UN ou bandeja" },
            { id: 4, item: "Pastel de Bobó de Camarão", sub: "cru · UN ou bandeja" },
            { id: 5, item: "Bolinho de Mandioca e Queijo", sub: "cru · UN ou bandeja" },
            { id: 6, item: "Tulipinha de Frango", sub: "cru · UN" },
            { id: 7, item: "Croquete de Costela", sub: "cru · UN" },
            { id: 8, item: "Arañita — Lula Tempurá", sub: "cru · porção" },
            { id: 9, item: "Chips de Camote", sub: "cru / estoque · bags" },
            { id: 10, item: "Quiabo Crocante (Pescado)", sub: "cru · porção" },
            { id: 11, item: "Pão Artesanal (tostado/frito)", sub: "UN" }
        ],
        equipments: [
            { id: "oleo_fritadeira_1", label: "Óleo Fritadeira 1 — Estado", type: "text" },
            { id: "oleo_fritadeira_2", label: "Óleo Fritadeira 2 — Estado", type: "text" },
            { id: "ultima_troca_oleo", label: "Última troca", type: "text" },
            { id: "obs_pendencias_oleo", label: "Observações / Pendências", type: "text" }
        ]
    }
};
