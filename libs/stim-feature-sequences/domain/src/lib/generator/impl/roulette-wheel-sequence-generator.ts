import { Logger } from '@nestjs/common';

import { ExperimentSupportSequences, OutputForSequence } from '@stechy1/diplomka-share';

import { SequenceGenerator } from '../sequence-generator';

/**
 * Generátor sekvencí postavený na principu ruletového kola
 */
export class RouletteWheelSequenceGenerator implements SequenceGenerator {
  private readonly logger: Logger = new Logger(RouletteWheelSequenceGenerator.name);

  public readonly name = RouletteWheelSequenceGenerator.name;

  /**
   * Pomocná funkce, která otestuje, zda-li je možné vložit testovanou hodnotu
   * do aktuální sekvence
   *
   * @param sequence Aktuální sekvence
   * @param stimul Vlastnosti výstupu
   * @param value Číslo stimulu
   */
  _isStimulPossibleToUse(sequence: number[], stimul: OutputForSequence, value: number): boolean {
    // Pokud stimul není závislý na žádných jiných stimulech
    if (stimul.dependencies === null || !(stimul.dependencies[0] instanceof Array) || stimul.dependencies[0].length === 0) {
      // Automaticky vrátím true - vždy bude možné tento stimul použít
      return true;
    }
    // Založím proměnnou s výsledky
    const result: Record<number, boolean> = {};
    this.logger.debug(`Budu testovat všechny závislosti ${value}. stimulu.`);
    // Projdu všechny závislosti stimulu
    for (const dependency of stimul.dependencies[0]) {
      // Vložím do výsledné proměnné na daný index příznak, že výstup nevyhovuje
      result[dependency.destOutput] = false;
      // Získám číslo výstupu
      const stimulNumber = dependency.destOutput;
      this.logger.debug(`Testuji závislost se stimulem: ${stimulNumber}.`);
      const occurrence = dependency.count;
      const inRow = false;
      let count = 0;

      for (let i = sequence.length - 1; i >= 0; i--) {
        // Pokud narazím na stimul s hodnotou dotazovaného stimulu, nemůžu ho použít
        if (sequence[i] === value) {
          this.logger.warn('Narazil jsem na dotazovaný stimul, takže nový nemůžu použít');
          return false;
        }

        if (sequence[i] === stimulNumber) {
          if (inRow) {
            count = 1;
            for (let j = i - 1; j >= 0; j--) {
              if (sequence[j] !== stimulNumber) {
                return false;
              } else {
                count++;
                if (occurrence === count) {
                  break;
                }
              }
            }
          } else {
            this.logger.verbose('Našel jsem závislý stimul.');
            count++;
          }
          if (occurrence === count) {
            result[dependency.destOutput] = true;
            break;
          }
        }
      }

      if (result[dependency.destOutput] === false) {
        return false;
      }
    }

    return true;
  }

  /**
   * Vytvoří novou požadovanou sekvenci pomocí metody ruletového kola
   *
   * @param experiment Experiment, pro který se sekvence generuje
   * @param sequenceSize Délka sekvence
   */
  generate(experiment: ExperimentSupportSequences, sequenceSize: number): number[] {
    this.logger.log(`Budu vytvářet novou sequenci pro experiment s délkou: ${sequenceSize} a maximální distribucí: ${experiment.maxDistribution}.`);
    const stimulyCount = experiment.outputCount;
    const sequence = [];
    const pow = Math.pow(2, 32);
    // Inicializuji "ruletové kolo"
    const distributions: { from: number; to: number }[] = [];
    distributions.push({ from: 0, to: experiment.outputs[0].distribution });
    for (let i = 1; i < experiment.outputCount; i++) {
      const distribution = {
        from: distributions[i - 1].to,
        to: distributions[i - 1].to + experiment.outputs[i].distribution,
      };
      distributions.push(distribution);
    }
    let value = 0;
    const randomIfNotFound = distributions.map((distribution) => distribution.from).reduce((previousValue, currentValue) => previousValue + currentValue) === 0;

    this.logger.debug(distributions);

    for (let i = 0; i < sequenceSize; i++) {
      let seed = Date.now();
      let found = false;
      do {
        // Hodím si kostkou v ruletovém kole
        seed = (1103515245 * seed + 9343) % pow;
        const rand = seed % experiment.maxDistribution;
        this.logger.debug(`Generuji ${i}. stimul s ruletovým výsledkem: ${rand}`);
        let stimul: OutputForSequence;
        value = 0;

        for (let j = 0; j < stimulyCount; j++) {
          stimul = experiment.outputs[j];
          this.logger.verbose(`Distribuce v intervalu: <${distributions[j].from};${distributions[j].to})`);
          if (rand >= distributions[j].from && rand < distributions[j].to) {
            if (this._isStimulPossibleToUse(sequence, stimul, j)) {
              this.logger.debug(`Chytil se výstup na indexu: ${j}.`);
              found = true;
              value = j;
              break;
            }
          }
        }

        if (!found) {
          this.logger.warn('Nebyla nalezená žádná vhodná kombinace pro stimuly.');
          if (randomIfNotFound) {
            this.logger.log('Používám náhodně zvolený stimul.');
            found = true;
            value = Math.min(Math.round(Math.random() * stimulyCount) + 1, stimulyCount);
          }
        }
      } while (!found);
      sequence.push(value);
    }
    return sequence;
  }
}
