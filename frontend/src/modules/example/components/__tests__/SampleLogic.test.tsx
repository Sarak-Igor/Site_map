import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// 🧪 EDUCAÇÃO: COMO TESTAR LÓGICAS DE NEGÓCIO NO SARAK ENGINE
// ---------------------------------------------------------------------------
// No Sarak Engine, o design (cores, bordas, sombras) é garantido pelo Core.
// Seus testes nos módulos devem focar na REGRA DE NEGÓCIO (Cálculos, cliques,
// formatação de dados e transições de estado).
//
// Abaixo, um exemplo de um componente de negócio simples:
// ---------------------------------------------------------------------------

const PayrollCalculator = ({ baseSalary }) => {
    const [bonusAdded, setBonusAdded] = useState(false);

    const calculateTotal = () => {
        return bonusAdded ? baseSalary * 1.5 : baseSalary;
    };

    return (
        <div className="p-4 bg-theme-card rounded-theme">
            <h2 className="text-xl font-bold text-theme-title">Calculadora de Folha</h2>

            <div data-testid="total-value" className="text-2xl mt-2 text-theme-main">
                R$ {calculateTotal().toFixed(2)}
            </div>

            <button
                className="mt-4 px-4 py-2 bg-theme-primary text-white rounded-md"
                onClick={() => setBonusAdded(true)}
            >
                Aplicar Bônus de 50%
            </button>
        </div>
    );
};


// ---------------------------------------------------------------------------
// SUÍTE DE TESTES (Vitest + React Testing Library)
// ---------------------------------------------------------------------------
describe('Exemplo: PayrollCalculator Business Logic', () => {

    it('deve renderizar o salário base corretamente sem bônus', () => {
        render(<PayrollCalculator baseSalary={1000} />);

        // Testa se o valor na tela é R$ 1000.00
        const totalDisplay = screen.getByTestId('total-value');
        expect(totalDisplay).toHaveTextContent('R$ 1000.00');
    });

    it('deve recalcular o total corretamente ao aplicar o bônus', () => {
        render(<PayrollCalculator baseSalary={1000} />);

        // Simula a ação do usuário clicando no botão (Ação de Negócio)
        const bonusButton = screen.getByText('Aplicar Bônus de 50%');
        fireEvent.click(bonusButton);

        // Testa se a lógica matemática de estado refletiu na visualização
        const totalDisplay = screen.getByTestId('total-value');
        expect(totalDisplay).toHaveTextContent('R$ 1500.00');
    });

});
