import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

// Tipos para os dados da API
type BibleBook = {
  abbrev: { pt: string };
  author: string;
  chapters: number;
  group: string;
  name: string;
  testament: string;
};

type Verse = {
  number: number;
  text: string;
};

const BIBLE_API_URL = "https://www.abibliadigital.com.br/api";

export const BiblePage = () => {
  const { toast } = useToast();
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedVersion, setSelectedVersion] = useState('nvi'); // Estado para a versão
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingChapter, setLoadingChapter] = useState(false);

  // Busca a lista de livros quando o componente é montado
  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const response = await fetch(`${BIBLE_API_URL}/books`);
        const data = await response.json();
        setBooks(data);
        if (data.length > 0) {
            setSelectedBook(data[0]);
        }
      } catch (error) {
        toast({ title: "Erro de Rede", description: "Falha ao carregar a lista de livros da Bíblia.", variant: "destructive" });
      } finally {
        setLoadingBooks(false);
      }
    };
    fetchBooks();
  }, [toast]);

  // Busca os versículos sempre que o livro, capítulo ou VERSÃO muda
  useEffect(() => {
    if (!selectedBook) return;

    const fetchVerses = async () => {
      setLoadingChapter(true);
      setVerses([]);
      try {
        const response = await fetch(`${BIBLE_API_URL}/verses/${selectedVersion}/${selectedBook.abbrev.pt}/${selectedChapter}`);
        const data = await response.json();
        setVerses(data.verses);
      } catch (error) {
        toast({ title: "Erro de Rede", description: "Falha ao carregar o capítulo selecionado.", variant: "destructive" });
      } finally {
        setLoadingChapter(false);
      }
    };
    fetchVerses();
  }, [selectedBook, selectedChapter, selectedVersion, toast]);
  
  const handleBookChange = (bookAbbrev: string) => {
    const book = books.find(b => b.abbrev.pt === bookAbbrev);
    if (book) {
        setSelectedBook(book);
        setSelectedChapter(1);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-3xl font-bold text-white">Bíblia Sagrada</h1>
      
      <Card className="bg-[#1f1f1f] border-neutral-800 sticky top-0 z-10">
        <CardHeader>
          <CardTitle className="text-white">Navegação</CardTitle>
          <CardDescription>
             Versão: {selectedVersion.toUpperCase()}
          </CardDescription>
           <div className="grid grid-cols-2 gap-4 pt-4">
            {/* Seletor de Livro */}
            <Select onValueChange={handleBookChange} value={selectedBook?.abbrev.pt}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Selecione um livro..." />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-white max-h-80">
                {loadingBooks ? <SelectItem value="loading" disabled>A carregar...</SelectItem> : (
                  books.map(book => <SelectItem key={book.abbrev.pt} value={book.abbrev.pt}>{book.name}</SelectItem>)
                )}
              </SelectContent>
            </Select>
            
            {/* Seletor de Capítulo */}
            <Select onValueChange={(value) => setSelectedChapter(Number(value))} value={String(selectedChapter)}>
              <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                <SelectValue placeholder="Capítulo" />
              </SelectTrigger>
              <SelectContent className="bg-neutral-800 border-neutral-700 text-white max-h-80">
                {selectedBook && Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(chapterNum => (
                    <SelectItem key={chapterNum} value={String(chapterNum)}>Capítulo {chapterNum}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Seletor de Versão */}
          <div className="pt-4">
            <Select onValueChange={setSelectedVersion} value={selectedVersion}>
                <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectValue placeholder="Versão"/>
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="nvi">Nova Versão Internacional (NVI)</SelectItem>
                    <SelectItem value="acf">Almeida Corrigida Fiel (ACF)</SelectItem>
                </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>
        
      <div className="py-4">
        {loadingChapter ? (
            <div className="space-y-4 pt-4">
                <Skeleton className="h-4 w-full bg-neutral-700" />
                <Skeleton className="h-4 w-full bg-neutral-700" />
                <Skeleton className="h-4 w-3/4 bg-neutral-700" />
            </div>
        ) : (
            <div className="pt-4 space-y-6 text-lg leading-relaxed text-neutral-200">
                {verses.map(verse => (
                    <p key={verse.number}>
                        <sup className="font-bold text-primary pr-2">{verse.number}</sup>
                        {verse.text}
                    </p>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
