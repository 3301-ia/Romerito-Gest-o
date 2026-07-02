const CHECKLIST_PDF_SCHEMA = {
    entradas1: {
        title: "ENTRADAS 1",
        volumeItems: [
            { id: 1, item: "Steak Tartare de Wagyu", sub: "" },
            { id: 2, item: "Carpaccio", sub: "" },
            { id: 3, item: "Milho Doce", sub: "" },
            { id: 4, item: "Picolé Mineiro", sub: "" },
            { id: 5, item: "Pastel de Queijo", sub: "" },
            { id: 6, item: "Pastel Bobó de Camarão", sub: "" },
            { id: 7, item: "Tataki / Sando", sub: "" },
            { id: 8, item: "Arañita / Lulinha", sub: "" },
            { id: 9, item: "Salmão", sub: "" },
            { id: 10, item: "Ceviche", sub: "" },
            { id: 11, item: "Bolinho de Mandioca", sub: "" },
            { id: 12, item: "Tulipinha de Frango", sub: "" },
            { id: 13, item: "Croquete de Costela", sub: "" },
            { id: 14, item: "Molho Pelati", sub: "" },
            { id: 15, item: "Maionese de Ostra / Ponzu", sub: "" },
            { id: 16, item: "Maionese Kewpie", sub: "" },
            { id: 17, item: "Pesto de Pistache", sub: "" },
            { id: 18, item: "Gremolata", sub: "" },
            { id: 19, item: "Baguete", sub: "" }
        ],
        countItems: [
            { id: 1, item: "Burrata (un.)", sub: "" },
            { id: 2, item: "Massa Fermentação Longa", sub: "" }
        ]
    },
    entradas2: {
        title: "ENTRADAS 2",
        volumeItems: [
            { id: 1, item: "Fritas", sub: "" },
            { id: 2, item: "Cesto de Pães", sub: "" },
            { id: 3, item: "Bacalhau Confitado", sub: "" },
            { id: 4, item: "Petit Tender Angus", sub: "" },
            { id: 5, item: "Salada", sub: "" },
            { id: 6, item: "Manteiga Trufada", sub: "" },
            { id: 7, item: "Ovas de Tobiko / Massago", sub: "" },
            { id: 8, item: "Vinagrete Trufado", sub: "" },
            { id: 9, item: "Sriracha", sub: "" },
            { id: 10, item: "Molho de Iogurte", sub: "" },
            { id: 11, item: "Nozes Caramelizadas", sub: "" },
            { id: 12, item: "Crocante de Amendoim", sub: "" },
            { id: 13, item: "Chips de Camote", sub: "" },
            { id: 14, item: "Couvert — mise en place", sub: "" }
        ],
        countItems: [
            { id: 1, item: "Batatas Fritas (Bags)", sub: "" },
            { id: 2, item: "Pão Artesanal", sub: "" },
            { id: 3, item: "Gelato Mi Garba (Profiterole)", sub: "" }
        ]
    },
    fogaoPasse: {
        title: "FOGÃO / PASSE",
        volumeItems: [
            { id: 1, item: "Purê de Funcho", sub: "" },
            { id: 2, item: "Arroz de Romesco", sub: "" },
            { id: 3, item: "Linguine Alfredo (pré-cozido)", sub: "" },
            { id: 4, item: "Molho Roti", sub: "" },
            { id: 5, item: "Molho Alfredo", sub: "" },
            { id: 6, item: "Creme de Trufas", sub: "" },
            { id: 7, item: "Beurre Blanc", sub: "" },
            { id: 8, item: "Camote Confit", sub: "" },
            { id: 9, item: "Aspargos (branqueados)", sub: "" },
            { id: 10, item: "Pupunha (laminada)", sub: "" },
            { id: 11, item: "Gremolata", sub: "" },
            { id: 12, item: "Arroz Branco", sub: "" },
            { id: 13, item: "Farofa de Ovos", sub: "" },
            { id: 14, item: "Batata Parrillera (pré-assada)", sub: "" },
            { id: 15, item: "Vegetais Parrilleros", sub: "" },
            { id: 16, item: "Sal Grosso / Parrilla", sub: "" },
            { id: 17, item: "Chimichurri", sub: "" },
            { id: 18, item: "Vinagrete", sub: "" },
            { id: 19, item: "Molho de Cerveja Escura", sub: "" },
            { id: 20, item: "Farofa de Panko", sub: "" },
            { id: 21, item: "Manteiga de Ervas", sub: "" },
            { id: 22, item: "Limão / Cítrico", sub: "" },
            { id: 23, item: "Tomilho / Ervas frescas", sub: "" },
            { id: 24, item: "Papel / Embalagem Parrilla", sub: "" }
        ],
        countItems: [
            { id: 1, item: "Bags Linguine seco", sub: "" },
            { id: 2, item: "Potes Molho Roti", sub: "" },
            { id: 3, item: "Potes Creme de Trufas", sub: "" },
            { id: 4, item: "Potes Romesco base", sub: "" }
        ],
        passeAcarte: [
            { id: 1, item: "Polvo", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 2, item: "Camarão", sub: "", parLevels: { baixo: 15, medio: 25, alto: 40 } },
            { id: 3, item: "Pescado do dia", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 4, item: "Salmão", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 5, item: "Tilápia", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 6, item: "Lulinha / Arañita", sub: "", parLevels: { baixo: 15, medio: 25, alto: 40 } },
            { id: 7, item: "Filé Mignon", sub: "", parLevels: { baixo: 15, medio: 30, alto: 50 } },
            { id: 8, item: "Parmegiana", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 9, item: "Petit Tender Angus", sub: "", parLevels: { baixo: 10, medio: 15, alto: 25 } }
        ]
    },
    parrilla: {
        title: "PARRILLA & PROTEÍNAS",
        parrillaAcarte: [
            { id: 1, item: "Picanha Bovina", sub: "", parLevels: { baixo: 15, medio: 30, alto: 50 } },
            { id: 2, item: "Ancho Red Angus", sub: "", parLevels: { baixo: 15, medio: 30, alto: 50 } },
            { id: 3, item: "Flat Iron", sub: "", parLevels: { baixo: 10, medio: 20, alto: 35 } },
            { id: 4, item: "Fraldinha", sub: "", parLevels: { baixo: 10, medio: 20, alto: 35 } },
            { id: 5, item: "Denver", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 6, item: "Chorizo", sub: "", parLevels: { baixo: 15, medio: 25, alto: 45 } },
            { id: 7, item: "Assado de Tira", sub: "", parLevels: { baixo: 8, medio: 15, alto: 25 } },
            { id: 8, item: "Picanha de Cordeiro", sub: "", parLevels: { baixo: 5, medio: 10, alto: 20 } },
            { id: 9, item: "Linguiça Artesanal de Ancho", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 10, item: "Hambúrguer", sub: "", parLevels: { baixo: 20, medio: 40, alto: 60 } },
            { id: 11, item: "Linguiça de Cordeiro", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 12, item: "Isca de Filé", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } },
            { id: 13, item: "Tournedor 200g", sub: "", parLevels: { baixo: 10, medio: 20, alto: 30 } }
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
            { id: 1, item: "Fritas — Batata Parrillera", sub: "" },
            { id: 2, item: "Fritas — Kids / Parmegiana", sub: "" },
            { id: 3, item: "Milho Doce", sub: "" },
            { id: 4, item: "Pastel de Queijo", sub: "" },
            { id: 5, item: "Pastel Bobó de Camarão", sub: "" },
            { id: 6, item: "Bolinho de Mandioca", sub: "" },
            { id: 7, item: "Croquete de Costela", sub: "" },
            { id: 8, item: "Tulipinha de Frango", sub: "" },
            { id: 9, item: "Lulinha", sub: "" }
        ]
    },
    executivo: {
        title: "EXECUTIVO",
        countItems: [
            { id: 1, item: "Chorizo (Executivo)", sub: "" },
            { id: 2, item: "Parmegiana (Executivo)", sub: "" },
            { id: 3, item: "Fraldinha 200g (Executivo)", sub: "" },
            { id: 4, item: "Peito de Frango (Executivo)", sub: "" },
            { id: 5, item: "Salmão (Executivo)", sub: "" },
            { id: 6, item: "Tilápia (Executivo)", sub: "" }
        ]
    }
};
