import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const API_KEY = "b13053fc49da1f197b6a9e51fd299c78"; // 🔐 Substitua pelo seu token da API Bible
const BIBLE_ID = "d63894c8d9a7a503-01"; // NVI PT-BR
const BASE_URL = "https://api.scripture.api.bible/v1";

// Mapeamento manual dos nomes dos livros para PT-BR
const bookNameMap: Record<string, string> = {
  GEN: "Gênesis",
  EXO: "Êxodo",
  LEV: "Levítico",
  NUM: "Números",
  DEU: "Deuteronômio",
  JOS: "Josué",
  JDG: "Juízes",
  RUT: "Rute",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
  "1KI": "1 Reis",
  "2KI": "2 Reis",
  "1CH": "1 Crônicas",
  "2CH": "2 Crônicas",
  EZR: "Esdras",
  NEH: "Neemias",
  EST: "Ester",
  JOB: "Jó",
  PSA: "Salmos",
  PRO: "Provérbios",
  ECC: "Eclesiastes",
  SNG: "Cantares de Salomão",
  ISA: "Isaías",
  JER: "Jeremias",
  LAM: "Lamentações",
  EZK: "Ezequiel",
  DAN: "Daniel",
  HOS: "Oséias",
  JOL: "Joel",
  AMO: "Amós",
  OBA: "Obadias",
  JON: "Jonas",
  MIC: "Miquéias",
  NAM: "Naum",
  HAB: "Habacuque",
  ZEP: "Sofonias",
  HAG: "Ageu",
  ZEC: "Zacarias",
  MAL: "Malaquias",
  MAT: "Mateus",
  MRK: "Marcos",
  LUK: "Lucas",
  JHN: "João",
  ACT: "Atos",
  ROM: "Romanos",
  "1CO": "1 Coríntios",
  "2CO": "2 Coríntios",
  GAL: "Gálatas",
  EPH: "Efésios",
  PHP: "Filipenses",
  COL: "Colossenses",
  "1TH": "1 Tessalonicenses",
  "2TH": "2 Tessalonicenses",
  "1TI": "1 Timóteo",
  "2TI": "2 Timóteo",
  TIT: "Tito",
  PHM: "Filemom",
  HEB: "Hebreus",
  JAS: "Tiago",
  "1PE": "1 Pedro",
  "2PE": "2 Pedro",
  "1JN": "1 João",
  "2JN": "2 João",
  "3JN": "3 João",
  JUD: "Judas",
  REV: "Apocalipse"
};

type Book = { id: string; name: string };
type Chapter = { id: string; reference: string };
type Verse = { id: string; reference: string; content: string };

export const BiblePage = () => {
  const { toast } = useToast();

  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [verses, setVerses] = useState<Verse[]>([]);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingVerses, setLoadingVerses] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const res = await fetch(`${BASE_URL}/bibles/${BIBLE_ID}/books`, {
          headers: { 'api-key': API_KEY }
        });
        const data = await res.json();
        setBooks(data.data);
        setSelectedBook(data.data[0]);
      } catch (err) {
        toast({
          title: "Erro ao carregar livros",
          description: "Verifique sua conexão ou chave de API.",
          variant: "destructive"
        });
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, [toast]);

  useEffect(() => {
    if (!selectedBook) return;
    const fetchChapters = async () => {
      try {
        const res = await fetch(`${BASE_URL}/bibles/${BIBLE_ID}/books/${selectedBook.id}/chapters`, {
          headers: { 'api-key': API_KEY }
        });
        const data = await res.json();
        setChapters(data.data);
        setSelectedChapter(data.data[0]?.id);
      } catch (err) {
        toast({
          title: "Erro ao carregar capítulos",
          description: "Capítulos não disponíveis para este livro.",
          variant: "destructive"
        });
      }
    };
    fetchChapters();
  }, [selectedBook, toast]);

  useEffect(() => {
    if (!selectedChapter) return;
    const fetchVerses = async () => {
      setLoadingVerses(true);
      try {
        const res = await fetch(`${BASE_URL}/bibles/${BIBLE_ID}/chapters/${selectedChapter}?content-type=text`, {
          headers: { 'api-key': API_KEY }
        });
        const data = await res.json();
        setVerses([{ id: data.data.id, reference: data.data.reference, content: data.data.content }]);
      } catch (err) {
        toast({
          title: "Erro ao carregar versículos",
          description: "Conteúdo do capítulo não disponível.",
          variant: "destructive"
        });
      } finally {
        setLoadingVerses(false);
      }
    };
    fetchVerses();
  }, [selectedChapter, toast]);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-white">Bíblia Sagrada (NVI)</h1>

      <Card className="bg-[#1f1f1f] border-neutral-800">
        <CardHeader>
          <CardTitle className="text-white">Navegação</CardTitle>
          <CardDescription className="text-neutral-400">Versão: NVI</CardDescription>

          <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Livros */}
            <Select onValueChange={(id) => setSelectedBook(books.find(b => b.id === id) || null)} value={selectedBook?.id}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Livro" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-white max-h-80">
                {loadingBooks ? (
                  <SelectItem value="loading" disabled>Carregando...</SelectItem>
                ) : (
                  books.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      {bookNameMap[book.id] || book.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {/* Capítulos */}
            <Select onValueChange={setSelectedChapter} value={selectedChapter || ""}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Capítulo" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-white max-h-80">
                {chapters.map(ch => (
                  <SelectItem key={ch.id} value={ch.id}>
                    {ch.reference}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="pt-6">
        {loadingVerses ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-neutral-700" />
            <Skeleton className="h-4 w-3/4 bg-neutral-700" />
            <Skeleton className="h-4 w-1/2 bg-neutral-700" />
          </div>
        ) : (
          verses.map(verse => (
            <div key={verse.id} className="text-neutral-100 leading-relaxed text-lg space-y-2">
              {verse.content
  .split(/\[(\d+)\]/g) // separa onde tiver [1], [2], etc.
  .filter(v => v.trim() !== '')
  .map((chunk, idx) => {
    if (/^\d+$/.test(chunk)) {
      return (
        <span key={idx} className="block font-bold text-primary mt-4">
          [{chunk}]
        </span>
      );
    }
    return (
      <p key={idx} className="text-neutral-100 leading-relaxed text-lg">
        {chunk.trim()}
      </p>
    );
  })}

            </div>
          ))
        )}
      </div>
    </div>
  );
};
