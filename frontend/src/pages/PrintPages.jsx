import React, { useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getBatch } from '../services/deliveryBatchService';
import { getSale } from '../services/saleService';
import { useReactToPrint } from 'react-to-print';
import RemitoPrint from './RemitoPrint';
import HojaRutaPrint from './HojaRutaPrint';
import CargaPrint from './CargaPrint';

export default function PrintPages() {
  const { type, id } = useParams();
  const componentRef = useRef();

  // Hooks always en el mismo orden
  const saleQuery = useQuery({
    queryKey: ['sale', id],
    queryFn: () => getSale(id).then(res => res.data),
    enabled: type === 'remito'
  });

  const batchQuery = useQuery({
    queryKey: ['batch', id],
    queryFn: () => getBatch(id).then(res => res.data),
    enabled: type !== 'remito'
  });

  const dataQuery = type === 'remito' ? saleQuery : batchQuery;

  const handlePrint = useReactToPrint({ content: () => componentRef.current });

  if (dataQuery.isLoading) return <p>Cargando...</p>;
  if (dataQuery.error) return <p>Error al cargar datos</p>;

  const data = dataQuery.data;
  let Component;
  if (type === 'remito') Component = RemitoPrint;
  else if (type === 'rutas') Component = HojaRutaPrint;
  else Component = CargaPrint;

  return (
    <div className="container mt-4">
      <button className="btn btn-primary mb-3" onClick={handlePrint}>
        Imprimir {type}
      </button>
      <Component
        ref={componentRef}
        {...(type === 'remito' ? { sale: data } : { batch: data })}
      />
    </div>
  );
}
