import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck, Package, CheckCircle2, Clock, XCircle, RotateCcw,
  Search, MapPin, ArrowRight, CalendarCheck, ExternalLink,
} from 'lucide-react';
import { orderService } from '../services/orderService';
import { useAppearance } from '../context/AppearanceContext';
import { cn, getErrorMessage } from '../lib/utils';

const FLOW_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_META = {
  pending:    { label: 'Pending',    Icon: Clock,        color: 'text-ink',      border: 'border-border-minimal' },
  processing: { label: 'Processing', Icon: Package,      color: 'text-ink',      border: 'border-border-minimal' },
  shipped:    { label: 'Shipped',    Icon: Truck,        color: 'text-ink',      border: 'border-border-minimal' },
  delivered:  { label: 'Delivered',  Icon: CheckCircle2, color: 'text-success',  border: 'border-border-minimal' },
  cancelled:  { label: 'Cancelled',  Icon: XCircle,      color: 'text-danger',   border: 'border-border-minimal' },
  refunded:   { label: 'Refunded',   Icon: RotateCcw,    color: 'text-subtle',   border: 'border-border-minimal' },
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Extract structured data from Shiprocket's liveTracking response
function parseLiveTracking(live) {
  if (!live?.tracking_data) return null;
  const td = live.tracking_data;

  const track = td.shipment_track?.[0] ?? {};
  const activities = (td.shipment_track_activities ?? []).map(a => ({
    date:     a.date,
    status:   a.status   || '',
    activity: a.activity || a.status || '',
    location: a.location || '',
  }));

  return {
    currentStatus: track.current_status   || null,
    origin:        track.origin            || null,
    destination:   track.destination      || null,
    edd:           track.edd              || null,
    currentLocation: activities[0]?.location || null,
    activities,               // newest-first as returned by Shiprocket
  };
}

export default function TrackOrder() {
  const { awb: awbParam } = useParams();
  const navigate          = useNavigate();
  const { appearance }    = useAppearance();

  const [input,   setInput]   = useState(awbParam || '');
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const track = useCallback(async (code) => {
    const trimmed = code?.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await orderService.trackByAwb(trimmed);
      setResult(res.data);
      navigate(`/track/${trimmed}`, { replace: true });
    } catch (e) {
      setError(getErrorMessage(e, 'Tracking number not found. Please check and try again.'));
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (awbParam) track(awbParam);
  }, [awbParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e) => {
    e.preventDefault();
    track(input);
  };

  const live        = result ? parseLiveTracking(result.liveTracking) : null;
  const meta        = result ? (STATUS_META[result.status] || STATUS_META.pending) : null;
  const isTerminal  = result && ['cancelled', 'refunded'].includes(result.status);
  const currentStep = result && !isTerminal ? FLOW_STEPS.indexOf(result.status) : -1;

  // Use live activities if available, fall back to internal timeline
  const hasLiveActivities = live?.activities?.length > 0;

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Search Bar ── */}
      <div className="border-b border-border-minimal bg-white">
        <div className="max-w-2xl mx-auto px-6 py-14 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Truck className="w-4.5 h-4.5 text-subtle stroke-[1.2]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-subtle">Order Tracking</span>
          </div>
          <p className="text-[26px] font-light text-ink tracking-tight mb-8">
            Where is my order?
          </p>

          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter your tracking / AWB number"
              className="flex-1 border border-border-minimal bg-white px-5 py-3.5 text-[13px] text-ink placeholder:text-subtle focus:outline-none focus:border-ink transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex items-center gap-2 bg-ink text-white px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40 shrink-0"
            >
              {loading
                ? <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
                : <Search className="w-3.5 h-3.5" />
              }
              Track
            </button>
          </form>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-[12px] text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}
        </div>
      </div>

      {/* ── Result ── */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.awbCode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl mx-auto px-6 py-10 space-y-4"
          >

            {/* ── Current Location Banner (most important info) ── */}
            {live?.currentLocation && (
              <div className={cn(
                'border px-7 py-5 flex items-center gap-4',
                meta?.bg, meta?.border
              )}>
                <MapPin className={cn('w-5 h-5 shrink-0 stroke-[1.5]', meta?.color)} />
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-subtle mb-0.5">Current Location</p>
                  <p className={cn('text-[16px] font-bold', meta?.color)}>{live.currentLocation}</p>
                  {live.currentStatus && (
                    <p className="text-[11px] text-subtle mt-0.5">{live.currentStatus}</p>
                  )}
                </div>
              </div>
            )}

            {/* ── Order / Status Header ── */}
            <div className="bg-white border border-border-minimal">

              {/* Meta row */}
              <div className="px-7 py-5 border-b border-border-minimal flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-subtle mb-1">Order</p>
                  <p className="text-[14px] font-bold text-ink">{result.orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-subtle mb-1">Tracking No.</p>
                  <p className="text-[14px] font-bold text-ink tracking-wider">{result.awbCode}</p>
                  {result.courierName && (
                    <p className="text-[10px] text-subtle mt-0.5">via {result.courierName}</p>
                  )}
                  {result.awbCode && (
                    <a
                      href={`https://shiprocket.co/tracking/${result.awbCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-[9px] font-bold uppercase tracking-[0.15em] text-subtle hover:text-ink transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Track on Shiprocket
                    </a>
                  )}
                </div>
              </div>

              {/* Route: origin → destination + EDD */}
              {(live?.origin || live?.destination || live?.edd) && (
                <div className="px-7 py-4 border-b border-border-minimal flex flex-wrap items-center gap-6">
                  {live.origin && live.destination && (
                    <div className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                      <MapPin className="w-3.5 h-3.5 text-subtle stroke-[1.5] shrink-0" />
                      {live.origin}
                      <ArrowRight className="w-3.5 h-3.5 text-subtle" />
                      {live.destination}
                    </div>
                  )}
                  {live.edd && (
                    <div className="flex items-center gap-2 text-[11px] text-subtle ml-auto">
                      <CalendarCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                      Est. delivery: <span className="font-bold text-ink">{live.edd}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status badge */}
              <div className="px-7 py-4 flex items-center gap-3">
                {meta && (
                  <>
                    <meta.Icon className={cn('w-4 h-4 stroke-[1.5]', meta.color)} />
                    <span className={cn('text-[11px] font-bold uppercase tracking-[0.15em]', meta.color)}>
                      {meta.label}
                    </span>
                  </>
                )}
              </div>

              {/* Progress steps */}
              {!isTerminal && (
                <div className="px-7 pb-7 pt-1">
                  <div className="flex items-start">
                    {FLOW_STEPS.map((step, i) => {
                      const done    = i <= currentStep;
                      const current = i === currentStep;
                      const StepIcon = STATUS_META[step].Icon;
                      return (
                        <React.Fragment key={step}>
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={cn(
                              'w-8 h-8 border flex items-center justify-center transition-all',
                              done ? 'border-ink bg-ink text-white' : 'border-border-minimal bg-surface text-subtle'
                            )}>
                              <StepIcon className="w-3.5 h-3.5 stroke-[1.5]" />
                            </div>
                            <span className={cn(
                              'text-[9px] font-bold uppercase tracking-widest mt-2 text-center',
                              current ? 'text-ink' : done ? 'text-subtle' : 'text-subtle opacity-40'
                            )}>
                              {STATUS_META[step].label}
                            </span>
                          </div>
                          {i < FLOW_STEPS.length - 1 && (
                            <div className={cn(
                              'flex-1 h-px mt-4 mx-2',
                              i < currentStep ? 'bg-ink' : 'bg-border-minimal'
                            )} />
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ── Live Courier Scan History ── */}
            {hasLiveActivities && (
              <div className="bg-white border border-border-minimal">
                <div className="px-7 py-4 border-b border-border-minimal flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">Shipment History</h3>
                  <span className="text-[9px] text-subtle uppercase tracking-widest font-bold">Live · {result.courierName}</span>
                </div>

                <div className="relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-[42px] top-0 bottom-0 w-px bg-border-minimal" />

                  {live.activities.map((act, i) => (
                    <div key={i} className="flex items-start gap-5 px-7 py-5 relative">
                      {/* Dot */}
                      <div className={cn(
                        'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 z-10',
                        i === 0
                          ? 'border-ink bg-ink'
                          : 'border-border-minimal bg-white'
                      )} />

                      <div className="flex-1 min-w-0 pb-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className={cn(
                            'text-[12px] font-semibold leading-snug',
                            i === 0 ? 'text-ink' : 'text-subtle'
                          )}>
                            {act.activity}
                          </p>
                          {act.date && (
                            <p className="text-[10px] text-subtle shrink-0">{formatDate(act.date)}</p>
                          )}
                        </div>
                        {act.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-subtle stroke-[1.5] shrink-0" />
                            <p className={cn(
                              'text-[11px] font-medium',
                              i === 0 ? 'text-ink' : 'text-subtle'
                            )}>
                              {act.location}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Internal Timeline fallback (when no live data yet) ── */}
            {!hasLiveActivities && result.timeline?.length > 0 && (
              <div className="bg-white border border-border-minimal">
                <div className="px-7 py-4 border-b border-border-minimal">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">Order Timeline</h3>
                </div>
                <div className="relative">
                  <div className="absolute left-[42px] top-0 bottom-0 w-px bg-border-minimal" />
                  {[...result.timeline].reverse().map((event, i) => {
                    const m = STATUS_META[event.status] || STATUS_META.pending;
                    const EventIcon = m.Icon;
                    return (
                      <div key={i} className="flex items-start gap-5 px-7 py-5 relative">
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 z-10',
                          i === 0 ? 'border-ink bg-ink' : 'border-border-minimal bg-white'
                        )} />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <p className={cn(
                              'text-[12px] font-semibold',
                              i === 0 ? 'text-ink' : 'text-subtle'
                            )}>
                              {m.label}
                            </p>
                            {event.createdAt && (
                              <p className="text-[10px] text-subtle shrink-0">{formatDate(event.createdAt)}</p>
                            )}
                          </div>
                          {event.note && (
                            <p className="text-[11px] text-subtle mt-0.5 leading-relaxed">{event.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
