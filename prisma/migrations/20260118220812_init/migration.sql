-- CreateTable
CREATE TABLE "rejection_cases" (
    "id" SERIAL NOT NULL,
    "codigo_sc" TEXT NOT NULL,
    "dni_cif" TEXT NOT NULL,
    "nombre_apellidos" TEXT NOT NULL,
    "cups" TEXT NOT NULL,
    "contrato_nc" TEXT NOT NULL,
    "linea_negocio" TEXT NOT NULL,
    "direccion_completa" TEXT NOT NULL,
    "codigo_postal" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "provincia" TEXT NOT NULL,
    "ccaa" TEXT NOT NULL,
    "distribuidora" TEXT NOT NULL,
    "grupo_distribuidora" TEXT NOT NULL,
    "email_contacto" TEXT NOT NULL,
    "telefono_contacto" TEXT NOT NULL,
    "proceso" TEXT NOT NULL,
    "potencia_actual" TEXT,
    "potencia_solicitada" TEXT,
    "status" TEXT NOT NULL DEFAULT 'In progress',
    "email_thread_id" TEXT,
    "fecha_primer_contacto" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rejection_cases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_events" (
    "id" TEXT NOT NULL,
    "case_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rejection_cases_codigo_sc_key" ON "rejection_cases"("codigo_sc");

-- CreateIndex
CREATE INDEX "case_events_case_id_idx" ON "case_events"("case_id");

-- CreateIndex
CREATE INDEX "case_events_timestamp_idx" ON "case_events"("timestamp");

-- AddForeignKey
ALTER TABLE "case_events" ADD CONSTRAINT "case_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "rejection_cases"("codigo_sc") ON DELETE CASCADE ON UPDATE CASCADE;
