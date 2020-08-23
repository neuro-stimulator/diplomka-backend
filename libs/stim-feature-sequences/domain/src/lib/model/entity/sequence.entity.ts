import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// import { ExperimentEntity } from '@diplomka-backend/stim-feature-experiments';

@Entity()
export class SequenceEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  userId: number;

  // @ManyToOne((experiment) => ExperimentEntity)
  // @JoinColumn({ name: 'experimentId', referencedColumnName: 'id' })
  @Column({ type: 'integer', nullable: true })
  experimentId: number;

  @Column({ length: 255, type: 'text' })
  name: string;

  @Column({ type: 'integer' })
  created: number;

  @Column({ type: 'text' })
  data: string;

  @Column({ type: 'integer' })
  size: number;

  @Column({ type: 'text' })
  tags: string;
}
